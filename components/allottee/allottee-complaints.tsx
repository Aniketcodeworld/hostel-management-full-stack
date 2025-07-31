"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus } from "lucide-react";

export function AllotteeComplaints() {
  const [complaints, setComplaints] = useState([
    { id: 1, title: "Flickering lights", description: "The lights in my room flicker constantly and it's affecting my studies.", category: "Electrical", status: "Open", priority: "Medium", submittedOn: "2023-04-02" },
    { id: 2, title: "Broken window latch", description: "The latch on my window is broken and I can't close it properly.", category: "Maintenance", status: "In Progress", priority: "Low", submittedOn: "2023-04-05" },
    { id: 3, title: "Slow internet", description: "The internet connection in my room has been very slow for the past week.", category: "Internet", status: "Resolved", priority: "High", submittedOn: "2023-03-28" },
  ]);

  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComplaint.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!newComplaint.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!newComplaint.category) {
      toast.error("Please select a category");
      return;
    }
    if (!newComplaint.priority) {
      toast.error("Please select a priority");
      return;
    }

    const id = complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];

    setComplaints([
      ...complaints,
      {
        id,
        ...newComplaint,
        status: "Open",
        submittedOn: today,
      },
    ]);

    setNewComplaint({ title: "", description: "", category: "", priority: "" });
    toast.success("Complaint submitted successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Complaints</h2>
        <p className="text-muted-foreground">Submit and track your complaints.</p>
      </div>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit a New Complaint</DialogTitle>
              <DialogDescription>
                Fill out the form below to submit a new complaint.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitComplaint}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Brief title of your complaint"
                    value={newComplaint.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description of the issue"
                    rows={4}
                    value={newComplaint.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newComplaint.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Internet">Internet</SelectItem>
                        <SelectItem value="Noise">Noise</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newComplaint.priority}
                      onValueChange={(value) => handleSelectChange("priority", value)}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Complaint</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        {["all", "open", "in-progress", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <span>My Complaints</span>
                </CardTitle>
                <CardDescription>
                  {tab === "all" ? "All complaints you have submitted" : `Complaints marked as ${tab.replace("-", " ")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.filter(c => tab === "all" || c.status.toLowerCase().replace(" ", "-") === tab).length > 0 ? (
                      complaints
                        .filter(c => tab === "all" || c.status.toLowerCase().replace(" ", "-") === tab)
                        .map((complaint) => (
                          <TableRow key={complaint.id}>
                            <TableCell>#{complaint.id}</TableCell>
                            <TableCell>{complaint.title}</TableCell>
                            <TableCell>{complaint.category}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                complaint.status === "Open"
                                  ? "bg-red-100 text-red-800"
                                  : complaint.status === "In Progress"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {complaint.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                complaint.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : complaint.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {complaint.priority}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(complaint.submittedOn).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No complaints found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
