import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/lib/types";
import Link from "next/link";

async function getProject(projectId: string) {
  const docRef = doc(db, "projects", projectId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data() as Omit<Project, "id" | "createdAt"> & { createdAt: { toDate: () => Date } };
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  }
  return null;
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/portfolio"
              className="inline-flex items-center justify-center mb-8 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </div>
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
          <Link 
            href="/portfolio"
            className="inline-flex items-center justify-center mb-8 hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Project Details */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="opacity-100">
                <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-4 w-4 mr-1" />
                    {project.category}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.createdAt.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="glass p-6 rounded-lg mb-8">
                  <h2 className="text-xl font-semibold mb-4">Project Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
                
                <div className="glass p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Client</h3>
                      <p className="text-muted-foreground">Creative Agency XYZ</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Services</h3>
                      <p className="text-muted-foreground">{project.category}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Tools Used</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">Adobe Photoshop</span>
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">Adobe Illustrator</span>
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">Figma</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Project Images */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="opacity-100">
                <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                  <img 
                    src={project.images[0]} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {project.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {project.images.map((image, index) => (
                      <div 
                        key={index}
                        className="aspect-square rounded-md overflow-hidden"
                      >
                        <img 
                          src={image} 
                          alt={`${project.title} thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}