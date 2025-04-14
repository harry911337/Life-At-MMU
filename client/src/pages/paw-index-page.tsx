import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCampusCatSchema, CampusCat } from "@shared/schema";
import { PawPrint, Search, Heart } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const catSchema = insertCampusCatSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
  traits: z.array(z.string()).min(1, "At least one trait is required"),
});

export default function PawIndexPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [traitInput, setTraitInput] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Add trait to the list
  const addTrait = () => {
    if (traitInput.trim() && !selectedTraits.includes(traitInput.trim())) {
      setSelectedTraits([...selectedTraits, traitInput.trim()]);
      setTraitInput("");
    }
  };

  // Remove trait from the list
  const removeTrait = (trait: string) => {
    setSelectedTraits(selectedTraits.filter(t => t !== trait));
  };

  // Fetch campus cats
  const { data: cats, isLoading } = useQuery<CampusCat[]>({
    queryKey: ["/api/campus-cats", { location: activeLocation !== "All" ? activeLocation : undefined }],
  });

  // Form for adding new cat
  const form = useForm<z.infer<typeof catSchema>>({
    resolver: zodResolver(catSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      imageUrl: "",
      traits: [],
    },
  });

  // Update form traits when selectedTraits changes
  form.setValue("traits", selectedTraits);

  // Add cat mutation
  const addCatMutation = useMutation({
    mutationFn: async (data: z.infer<typeof catSchema>) => {
      const res = await apiRequest("POST", "/api/campus-cats", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campus-cats"] });
      setIsAddCatOpen(false);
      form.reset();
      setSelectedTraits([]);
    },
  });

  const onSubmit = (data: z.infer<typeof catSchema>) => {
    // Ensure traits are included
    data.traits = selectedTraits;
    addCatMutation.mutate(data);
  };

  // Filter cats based on search query
  const filteredCats = cats
    ? cats.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.traits.some(trait => trait.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isMobileSidebarOpen={isMobileSidebarOpen} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
        />
        
        <main className="flex-1 overflow-auto bg-neutral-50 p-4">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">PawPrint Index</h1>
                <p className="text-neutral-600">Meet the feline residents of MMU campus</p>
              </div>
              
              {user && (
                <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-500 text-white hover:bg-orange-600">
                      <PawPrint className="mr-2 h-4 w-4" />
                      Add New Cat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Campus Cat</DialogTitle>
                      <DialogDescription>
                        Add a new feline friend to the campus cat directory.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cat Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. Oreo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the cat's personality, appearance, etc." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Where is this cat usually seen?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Library">Library Area</SelectItem>
                                  <SelectItem value="Canteen">Canteen</SelectItem>
                                  <SelectItem value="Hostels">Hostels</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL (optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/cat-image.jpg" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="traits"
                          render={() => (
                            <FormItem>
                              <FormLabel>Traits</FormLabel>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="E.g. Friendly" 
                                    value={traitInput}
                                    onChange={(e) => setTraitInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTrait();
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button"
                                    onClick={addTrait}
                                  >
                                    Add
                                  </Button>
                                </div>
                                
                                {selectedTraits.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedTraits.map((trait, index) => (
                                      <div 
                                        key={index} 
                                        className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                                      >
                                        {trait}
                                        <button 
                                          type="button"
                                          className="text-neutral-500 hover:text-neutral-700 ml-1"
                                          onClick={() => removeTrait(trait)}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-neutral-500">
                                    Add traits like "Friendly", "Shy", "Orange", etc.
                                  </p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={addCatMutation.isPending}
                          >
                            {addCatMutation.isPending ? "Adding..." : "Add Cat"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs 
                defaultValue="All" 
                value={activeLocation} 
                onValueChange={setActiveLocation}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="All">All Cats</TabsTrigger>
                  <TabsTrigger value="Library">Library</TabsTrigger>
                  <TabsTrigger value="Canteen">Canteen</TabsTrigger>
                  <TabsTrigger value="Hostels">Hostels</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input 
                  placeholder="Search cats..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Cats Grid */}
            <div className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">Loading campus cats...</p>
                </div>
              ) : !filteredCats || filteredCats.length === 0 ? (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">No cats found</p>
                  {searchQuery && (
                    <p className="text-sm text-neutral-400 mt-2">
                      Try a different search term or clear the search
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCats.map((cat) => (
                    <Card key={cat.id} className="overflow-hidden bg-neutral-50 border border-neutral-200">
                      <div className="aspect-w-4 aspect-h-3 bg-neutral-200">
                        {cat.imageUrl ? (
                          <img 
                            src={cat.imageUrl} 
                            alt={cat.name} 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-neutral-300 flex items-center justify-center">
                            <PawPrint className="text-neutral-400 h-12 w-12" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-lg">{cat.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            cat.location === 'Library' ? 'bg-blue-100 text-primary' :
                            cat.location === 'Canteen' ? 'bg-orange-100 text-orange-700' :
                            cat.location === 'Hostels' ? 'bg-purple-100 text-purple-700' :
                            'bg-neutral-100 text-neutral-700'
                          }`}>
                            {cat.location}
                          </span>
                        </div>
                        
                        <p className="text-neutral-600 text-sm">
                          {cat.description}
                        </p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cat.traits.map((trait, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <button className="text-orange-500 hover:underline flex items-center">
                            <Heart className="mr-1 h-4 w-4" />
                            Favorite
                          </button>
                          <span className="text-neutral-500">
                            Last seen: {format(new Date(cat.lastSeen), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
