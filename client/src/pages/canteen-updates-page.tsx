import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCanteenOutletSchema, CanteenOutlet, insertOutletRatingSchema } from "@shared/schema";
import { Utensils, Clock } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";

const outletSchema = insertCanteenOutletSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  priceRange: z.string().min(3, "Price range is required"),
  openingHours: z.string().min(3, "Opening hours are required"),
  isOpen: z.boolean().default(true),
});

const ratingSchema = insertOutletRatingSchema.extend({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default function CanteenUpdatesPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [currentOutletId, setCurrentOutletId] = useState<number | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ratingValue, setRatingValue] = useState(5);

  const toggleSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Add category to the list
  const addCategory = () => {
    if (categoryInput.trim() && !selectedCategories.includes(categoryInput.trim())) {
      setSelectedCategories([...selectedCategories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  // Remove category from the list
  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  // Open rating dialog
  const openRatingDialog = (outletId: number) => {
    setCurrentOutletId(outletId);
    setIsRatingOpen(true);
  };

  // Fetch canteen outlets
  const { data: outlets, isLoading } = useQuery<CanteenOutlet[]>({
    queryKey: ["/api/canteen-outlets", { category: activeCategory !== "All" ? activeCategory : undefined }],
  });

  // Form for adding new outlet (admin only)
  const outletForm = useForm<z.infer<typeof outletSchema>>({
    resolver: zodResolver(outletSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      categories: [],
      priceRange: "",
      openingHours: "",
      isOpen: true,
    },
  });

  // Form for adding ratings
  const ratingForm = useForm<z.infer<typeof ratingSchema>>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      outletId: 0,
      rating: 5,
      comment: "",
    },
  });

  // Update outlet form categories when selectedCategories changes
  outletForm.setValue("categories", selectedCategories);

  // Add outlet mutation (admin only)
  const addOutletMutation = useMutation({
    mutationFn: async (data: z.infer<typeof outletSchema>) => {
      const res = await apiRequest("POST", "/api/canteen-outlets", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/canteen-outlets"] });
      setIsAddOutletOpen(false);
      outletForm.reset();
      setSelectedCategories([]);
    },
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ratingSchema>) => {
      const res = await apiRequest("POST", "/api/outlet-ratings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outlet-ratings"] });
      setIsRatingOpen(false);
      ratingForm.reset();
      setRatingValue(5);
    },
  });

  const onOutletSubmit = (data: z.infer<typeof outletSchema>) => {
    // Ensure categories are included
    data.categories = selectedCategories;
    addOutletMutation.mutate(data);
  };

  const onRatingSubmit = (data: z.infer<typeof ratingSchema>) => {
    // Set the current outlet ID
    data.outletId = currentOutletId || 0;
    // Set the rating value from state
    data.rating = ratingValue;
    
    if (data.outletId) {
      addRatingMutation.mutate(data);
    }
  };

  // Configure outlet categories for the filter tabs
  const categories = outlets
    ? ["All", ...new Set(outlets.flatMap(outlet => outlet.categories))]
    : ["All"];

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
                <h1 className="text-2xl font-bold text-neutral-800">Canteen Updates</h1>
                <p className="text-neutral-600">Explore and rate campus food options</p>
              </div>
              
              {user?.isAdmin && (
                <Dialog open={isAddOutletOpen} onOpenChange={setIsAddOutletOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-500 text-white hover:bg-red-600">
                      <Utensils className="mr-2 h-4 w-4" />
                      Add New Outlet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Food Outlet</DialogTitle>
                      <DialogDescription>
                        Add a new food outlet to the campus canteen directory.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...outletForm}>
                      <form onSubmit={outletForm.handleSubmit(onOutletSubmit)} className="space-y-4">
                        <FormField
                          control={outletForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Outlet Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. Wok & Roll" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the food outlet, cuisine, etc." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="E.g. Main Canteen, 1st Floor" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="categories"
                          render={() => (
                            <FormItem>
                              <FormLabel>Categories</FormLabel>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="E.g. Asian" 
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCategory();
                                      }
                                    }}
                                  />
                                  <Button 
                                    type="button"
                                    onClick={addCategory}
                                  >
                                    Add
                                  </Button>
                                </div>
                                
                                {selectedCategories.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedCategories.map((category, index) => (
                                      <div 
                                        key={index} 
                                        className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                                      >
                                        {category}
                                        <button 
                                          type="button"
                                          className="text-neutral-500 hover:text-neutral-700 ml-1"
                                          onClick={() => removeCategory(category)}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-neutral-500">
                                    Add categories like "Asian", "Western", "Beverages", etc.
                                  </p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="priceRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Range</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="E.g. RM 7 - RM 15" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="openingHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opening Hours</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="E.g. 8:00 AM - 7:00 PM" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={outletForm.control}
                          name="isOpen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value === "true")} 
                                defaultValue={field.value ? "true" : "false"}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Open</SelectItem>
                                  <SelectItem value="false">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full bg-red-500 hover:bg-red-600"
                            disabled={addOutletMutation.isPending}
                          >
                            {addOutletMutation.isPending ? "Adding..." : "Add Outlet"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Rating Dialog */}
            <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Rate this Outlet</DialogTitle>
                  <DialogDescription>
                    Share your experience with this food outlet.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...ratingForm}>
                  <form onSubmit={ratingForm.handleSubmit(onRatingSubmit)} className="space-y-4">
                    <FormField
                      control={ratingForm.control}
                      name="rating"
                      render={() => (
                        <FormItem className="space-y-1">
                          <FormLabel>Your Rating</FormLabel>
                          <div className="flex justify-center py-2">
                            <StarRating 
                              rating={ratingValue} 
                              setRating={setRatingValue} 
                              size="lg" 
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={ratingForm.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Review (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your thoughts about this outlet..." 
                              className="min-h-[100px]"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={addRatingMutation.isPending}
                      >
                        {addRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
              <Tabs 
                defaultValue="All" 
                value={activeCategory} 
                onValueChange={setActiveCategory}
              >
                <TabsList className="bg-white h-auto flex flex-wrap p-1">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="px-4 py-2"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Outlets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="text-center py-8 col-span-2">
                  <Utensils className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">Loading food outlets...</p>
                </div>
              ) : !outlets || outlets.length === 0 ? (
                <div className="text-center py-8 col-span-2">
                  <Utensils className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500">No food outlets found</p>
                </div>
              ) : (
                outlets.map((outlet) => (
                  <div key={outlet.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-neutral-100 p-4 flex justify-between items-center">
                      <h3 className="font-medium text-lg">{outlet.name}</h3>
                      <div className="flex items-center">
                        <StarRating rating={4} readOnly size="sm" />
                        <span className="ml-1 text-sm text-neutral-600">(0)</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {outlet.categories.map((category, index) => (
                          <span 
                            key={index} 
                            className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      
                      <p className="text-neutral-600 mb-3">{outlet.description}</p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-600">Price Range: {outlet.priceRange}</span>
                        <span className={`font-medium ${outlet.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                          {outlet.isOpen ? 'Open Now' : 'Closed Now'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 p-3 border-t border-neutral-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">
                          Location: {outlet.location}
                        </span>
                        {user && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-sm text-red-500 hover:text-red-700 hover:bg-transparent p-0"
                            onClick={() => openRatingDialog(outlet.id)}
                          >
                            Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
