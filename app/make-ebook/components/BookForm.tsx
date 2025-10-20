import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookFormProps {
  title: string;
  author: string;
  isbn: string;
  onChange: (field: "title" | "author" | "isbn", value: string) => void;
}

export const BookForm: React.FC<BookFormProps> = ({ title, author, isbn, onChange }) => (
  <>
    <div>
      <Label htmlFor="title">Book Title</Label>
      <Input
        id="title"
        value={title}
        onChange={e => onChange("title", e.target.value)}
        placeholder="Enter book title"
        className="mt-1"
      />
    </div>
    <div>
      <Label htmlFor="author">Author</Label>
      <Input
        id="author"
        value={author}
        onChange={e => onChange("author", e.target.value)}
        placeholder="Enter author name"
        className="mt-1"
      />
    </div>
    <div>
      <Label htmlFor="isbn">Book ISBN</Label>
      <Input
        id="isbn"
        value={isbn}
        onChange={e => onChange("isbn", e.target.value)}
        placeholder="Enter ISBN"
        className="mt-1"
      />
    </div>
  </>
);