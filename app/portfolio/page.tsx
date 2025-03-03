"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import { Project } from "@/lib/types";
import { collection, getDocs, query, where, CollectionReference, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";

function PortfolioContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(categoryParam || "all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects") as CollectionReference<DocumentData>;
        
        const projectsQuery = categoryParam
          ? query(projectsRef, where("category", "==", categoryParam))
          : projectsRef;
        
        const querySnapshot = await getDocs(projectsQuery);
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
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [categoryParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(project => project.category === activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t("portfolio")}</h1>
            <p className="text-muted-foreground">
              Explore my creative work across various design disciplines
            </p>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-12">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="all">{t("all_projects")}</TabsTrigger>
                <TabsTrigger value="graphic">{t("graphic_design")}</TabsTrigger>
                <TabsTrigger value="motion">{t("motion_design")}</TabsTrigger>
                <TabsTrigger value="ui-ux">{t("ui_ux")}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-8">
              <ProjectGrid projects={filteredProjects} loading={loading} />
            </TabsContent>
            
            <TabsContent value="graphic" className="mt-8">
              <ProjectGrid projects={filteredProjects} loading={loading} />
            </TabsContent>
            
            <TabsContent value="motion" className="mt-8">
              <ProjectGrid projects={filteredProjects} loading={loading} />
            </TabsContent>
            
            <TabsContent value="ui-ux" className="mt-8">
              <ProjectGrid projects={filteredProjects} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PortfolioContent />
    </Suspense>
  );
}

function ProjectGrid({ projects, loading }: { projects: Project[], loading: boolean }) {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found in this category.</p>
      </div>
    );
  }
  
  return (
    <div className="masonry-grid">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative overflow-hidden rounded-lg"
        >
          <img 
            src={project.images[0]} 
            alt={project.title} 
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white text-xl font-bold">{project.title}</h3>
            <p className="text-white/80 mt-2 line-clamp-2">{project.description}</p>
            <Link href={`/portfolio/${project.id}`}>
              <button className="text-white hover:underline mt-2">
                {t("view_project")}
              </button>
            </Link>
          </div>
        </motion.div>
      ))}
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
  },
  {
    id: "4",
    title: "Product Packaging Design",
    description: "Creative packaging design for an organic skincare brand that emphasizes sustainability and natural ingredients.",
    category: "graphic",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: false,
    createdAt: new Date("2024-01-10")
  },
  {
    id: "5",
    title: "Character Animation",
    description: "Character design and animation for a children's educational series teaching basic science concepts.",
    category: "motion",
    images: [
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: false,
    createdAt: new Date("2024-02-15")
  },
  {
    id: "6",
    title: "E-commerce Website Redesign",
    description: "Complete redesign of an e-commerce platform focusing on improving conversion rates and user experience.",
    category: "ui-ux",
    images: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    featured: false,
    createdAt: new Date("2024-03-20")
  }
];