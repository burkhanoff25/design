"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

export default function AdminPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "graphic" as "graphic" | "motion" | "ui-ux",
    featured: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated and is admin
  useEffect(() => {
    if (!loading && (!user || !user.email?.includes("admin"))) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, loading, router, toast]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData: Project[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Project, "id" | "createdAt"> & { createdAt: { toDate: () => Date } };
          projectsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          });
        });
        
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Use sample data if Firebase fails or during development
        setProjects(sampleProjects);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && user.email?.includes("admin")) {
      fetchProjects();
    }
  }, [user]);

  const handleAddProject = () => {
    setCurrentProject(null);
    setFormData({
      title: "",
      description: "",
      category: "graphic",
      featured: false,
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setIsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      featured: project.featured,
    });
    setImageFiles([]);
    setImagePreviewUrls([...project.images]);
    setIsDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prevFiles) => [...prevFiles, ...filesArray]);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (imagePreviewUrls.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      
      // If we have new image files, upload them
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          imageUrls.push(url);
        }
      }
      
      // If editing, keep existing images that weren't removed
      if (currentProject) {
        const existingImages = currentProject.images.filter(url => 
          imagePreviewUrls.includes(url)
        );
        imageUrls = [...existingImages, ...imageUrls];
      }

      if (currentProject) {
        // Update existing project
        await updateDoc(doc(db, "projects", currentProject.id), {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          featured: formData.featured,
          images: imageUrls,
          updatedAt: new Date(),
        });

        toast({
          title: "Success",
          description: "Project updated successfully.",
        });

        // Update local state
        setProjects(projects.map(p => 
          p.id === currentProject.id 
            ? { 
                ...p, 
                title: formData.title,
                description: formData.description,
                category: formData.category,
                featured: formData.featured,
                images: imageUrls,
                updatedAt: new Date()
              } 
            : p
        ));
      } else {
        // Add new project
        const docRef = await addDoc(collection(db, "projects"), {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          featured: formData.featured,
          images: imageUrls,
          createdAt: new Date(),
        });

        toast({
          title: "Success",
          description: "Project added successfully.",
        });

        // Update local state
        const newProject: Project = {
          id: docRef.id,
          title: formData.title,
          description: formData.description,
          category: formData.category as 'graphic' | 'motion' | 'ui-ux',
          featured: formData.featured,
          images: imageUrls,
          createdAt: new Date(),
        };
        setProjects([...projects, newProject]);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentProject) return;
    
    try {
      await deleteDoc(doc(db, "projects", currentProject.id));
      
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      });
      
      // Update local state
      setProjects(projects.filter(p => p.id !== currentProject.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as "graphic" | "motion" | "ui-ux" }));
  };

  if (loading || (user && !user.email?.includes("admin"))) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{t("admin_panel")}</h1>
            <button 
              onClick={handleAddProject}
              className={buttonVariants({ variant: "default" })}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("add_project")}
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 glass rounded-lg">
              <p className="text-muted-foreground mb-4">No projects found. Add your first project!</p>
              <Button onClick={handleAddProject}>
                <Plus className="mr-2 h-4 w-4" />
                {t("add_project")}
              </Button>
            </div>
          ) : (
            <div className="glass rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>{t("project_title")}</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="w-16 h-16 rounded overflow-hidden">
                          <img 
                            src={project.images[0]} 
                            alt={project.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{project.category}</TableCell>
                      <TableCell>{project.featured ? "Yes" : "No"}</TableCell>
                      <TableCell>{project.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditProject(project)}
                            className={buttonVariants({ variant: "ghost", size: "icon" })}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project)}
                            className={buttonVariants({ variant: "ghost", size: "icon" })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      
      {/* Add/Edit Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentProject ? t("edit_project") : t("add_project")}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t("project_title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t("project_description")}</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">{t("project_category")}</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graphic">{t("graphic_design")}</SelectItem>
                  <SelectItem value="motion">{t("motion_design")}</SelectItem>
                  <SelectItem value="ui-ux">{t("ui_ux")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="featured">Featured Project</Label>
            </div>
            
            <div className="grid gap-2">
              <Label>{t("project_images")}</Label>
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Label
                  htmlFor="images"
                  className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {t("upload_images")}
                </Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></span>
                  Saving...
                </span>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle asChild>
              <h2>{t("delete_project")}</h2>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button className={buttonVariants({ variant: "outline" })}>
                {t("cancel")}
              </button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <button 
                onClick={confirmDelete}
                className={buttonVariants({ variant: "destructive" })}
              >
                Delete
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
}

// Sample projects data for development and fallback
const sampleProjects: Project[] = [
  {
    id: "1",
    title: "Brand Identity Design",
    description: "Complete brand identity design for a tech startup including logo, color palette, typography, and brand guidelines.",
    category: "graphic",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600775508114-5c30cf911a40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: true,
    createdAt: new Date("2023-10-15")
  },
  {
    id: "2",
    title: "Motion Graphics Explainer",
    description: "Animated explainer video for a financial services company explaining their product offerings in an engaging way.",
    category: "motion",
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: true,
    createdAt: new Date("2023-11-20")
  },
  {
    id: "3",
    title: "Mobile App UI Design",
    description: "User interface design for a fitness tracking mobile application with a focus on user experience and accessibility.",
    category: "ui-ux",
    images: [
      "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616469829941-c7200edec809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: true,
    createdAt: new Date("2023-12-05")
  }
];