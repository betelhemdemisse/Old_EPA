"use client";

import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Import images instead of icons
import regionImg from "../../assets/base-data/region.png";
import zoneImg from "../../assets/base-data/zone.png";
import woredaImg from "../../assets/base-data/woreda.png";
import rejectionImg from "../../assets/base-data/rejection.png";
import reportImg from "../../assets/base-data/report.png";
import subcategoryImg from "../../assets/base-data/citysub_categorization.png";
import penaltyImg from "../../assets/base-data/penalty.png";
import organizationImg from "../../assets/base-data/sub_penalty.png";
import stakeholderImg from "../../assets/base-data/priority.png";
import { FileText, ClipboardList, LayoutGrid, Search, MapPin, Newspaper, Ban , Lightbulb} from "lucide-react";

const baseDataItems = [
  {
    title: "Region or City Management",
    description: "This is the place to manage region or city.",
    icon: zoneImg,
    link: "/base-data/region_city",
  },
  {
    title: "Pollution Category",
    description: "This is the place to set routes or manage reports",
    icon: reportImg,
    link: "/base-data/report-category",
  },
  {
    title: "Epa Office Location",
    description: "This is the place to set routes or manage addresses",
    icon: rejectionImg,
    link: "/base-data/address",
  },
  {
    title: "Closure Reason",
    description: "This is the place to set routes or manage penalties",
    icon: penaltyImg,
    link: "/base-data/penalty-type",
  },
  {
    title: "Organization Structure",
    description: "This is the place to set routes or manage organization data",
    icon: organizationImg,
    link: "/base-data/organization",
  },
  // {
  //   title: "Stakeholder Registration",
  //   description: "This is the place to set routes or manage stakeholders",
  //   icon: stakeholderImg,
  //   link: "/base-data/stakeholder",
  // },
  // {
  //   title: "Form Types",
  //   description: "This is the place to manage form types",
  //   icon: FileText,
  //   link: "/base-data/form-types",
  //   type: "icon",
  // },
  // {
  //   title: "Report Types",
  //   description: "This is the place to manage report types",
  //   icon: ClipboardList,
  //   link: "/base-data/report-types",
  //   type: "icon",
  // },

  {
    title: "Sound Area",
    description: "This is the place to manage sound areas",
    icon: MapPin,
    link: "/base-data/sound-area",
    type: "icon",
  },
  {
    title: "Awareness",
    description: "This is the place to manage awareness related data",
    icon: Lightbulb,
    link: "/base-data/awareness",
    type: "icon",
  },
  {
    title: "Form/Report Types",
    description: "This is the place to manage form/reports types",
    icon: FileText,
    link: "/base-data/form-report-types",
    type: "icon",
  },
  // {
  //   title: "Reporting Forms",
  //   description: "This is the place to manage reporting forms",
  //   icon: LayoutGrid,
  //   link: "/base-data/reporting-forms",
  //   type: "icon",
  // }
  {
    title: "Rejection/Return Reasons",
    description: "This is the place to manage rejection reasons",
    icon: Ban,
    link: "/base-data/rejection-reasons",
    type: "icon",
  },
  {
    title: "News",
    description: "This is the place to manage news and announcements",
    icon: Newspaper,
    link: "/base-data/news",
    type: "icon",
  },

];

export default function BaseData() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredItems = baseDataItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-black">Base Data</h1>
        <p className="text-[#A3AED0] text-sm mt-1">
          This is the Base Data of the Super professional
        </p>
      </div>

      {/* Search Bar - Mobile Optimized */}
      {/* <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search base data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#387e53] focus:border-transparent text-sm sm:text-base"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {filteredItems.length} of {baseDataItems.length} items found
        </p>
      </div> */}

      {/* Grid Section - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {(filteredItems.length ? filteredItems : baseDataItems).map((item, idx) => (
          <div
            key={idx}
            className="flex-col md:flex md:flex-row items-center justify-between bg-white shadow-sm rounded-xl border border-gray-100 p-5 hover:shadow-md transition"
          >
            <div className="flex flex-col mid:flex-row items-start justify-between gap-4 w-full">
              {/* Left content */}
              <div className="flex items-start gap-4 flex-1">
                {item.type === "icon" ? (
                  <item.icon className="w-12 h-12 text-[#387e53]" />
                ) : (
                  <img src={item.icon} className="w-12 h-12 object-contain" />
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-800 text-base line-clamp-1">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Button moves under description until 1098px */}
              <div className="flex w-full mid:w-auto justify-start mid:justify-end mt-2 mid:mt-0">
                <Button
                  className="w-full sm:w-auto px-4 py-2 text-sm"
                  onClick={() => navigate(item.link)}
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            No base data items match your search for "{search}"
          </p>
          <Button
            onClick={() => setSearch("")}
            className="px-6"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}