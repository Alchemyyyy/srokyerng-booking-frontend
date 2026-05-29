// src/modules/properties/services/propertyService.js
// Images: real Unsplash photos of Cambodian/Southeast Asian hotels & properties

export const getOwnerProperties = async () => {
  return {
    data: [
      {
        id: 1,
        name: "Sokha Phnom Penh Hotel",
        type: "Hotel",
        location: "Phnom Penh",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop",
        amenities: [
          { id: 1, amenity_name: "Free WiFi" },
          { id: 2, amenity_name: "Swimming Pool" },
          { id: 3, amenity_name: "Restaurant" },
          { id: 4, amenity_name: "Spa & Wellness" },
          { id: 5, amenity_name: "Fitness Center" },
          { id: 6, amenity_name: "Airport Shuttle" },
          { id: 7, amenity_name: "24h Front Desk" },
          { id: 8, amenity_name: "Free Parking" },
        ],
      },
      {
        id: 2,
        name: "Kampot Garden Villa",
        type: "Villa",
        location: "Kampot",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200&h=200&fit=crop",
        amenities: [
          { id: 1, amenity_name: "Free WiFi" },
          { id: 2, amenity_name: "Swimming Pool" },
          { id: 3, amenity_name: "Restaurant" },
          { id: 9, amenity_name: "Tuk-Tuk Service" },
          { id: 10, amenity_name: "Tour Desk" },
        ],
      },
      {
        id: 3,
        name: "Mekong Riverside Suites",
        type: "Apartment",
        location: "Phnom Penh",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&h=200&fit=crop",
        amenities: [
          { id: 11, amenity_name: "Beachfront" },
          { id: 12, amenity_name: "Infinity Pool" },
          { id: 13, amenity_name: "Dive Center" },
          { id: 3,  amenity_name: "Restaurant" },
          { id: 14, amenity_name: "Bar & Lounge" },
          { id: 15, amenity_name: "Watersports" },
          { id: 1,  amenity_name: "Free WiFi" },
        ],
      },
    ],
  };
};