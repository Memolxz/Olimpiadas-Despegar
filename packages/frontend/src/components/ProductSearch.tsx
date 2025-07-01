
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productType, setProductType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Find Your Perfect Travel Experience
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search destinations, hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        
        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Product Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">Flights</SelectItem>
            <SelectItem value="hotel">Hotels</SelectItem>
            <SelectItem value="package">Packages</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
            <SelectItem value="transfer">Transfers</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-500">$0 - $500</SelectItem>
            <SelectItem value="500-1000">$500 - $1,000</SelectItem>
            <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
            <SelectItem value="2500+">$2,500+</SelectItem>
          </SelectContent>
        </Select>
        
        <Button className="h-12 bg-blue-600 hover:bg-blue-700">
          <Filter className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
};
