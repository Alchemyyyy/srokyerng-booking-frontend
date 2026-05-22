// src/modules/properties/services/propertyService.js

export const getOwnerProperties = async () => {
  return {
    data: [
      {
        id: 1,
        name: "Ocean Breeze Villa",
        type: "Villa",
        location: "Phnom Penh",
        image: "https://picsum.photos/200/200?1",
        amenities: [
          { id: 1, amenity_name: "Free WiFi" },
          { id: 2, amenity_name: "Swimming Pool" },
          { id: 3, amenity_name: "Restaurant" },
        ],
      },
      {
        id: 2,
        name: "Sunset Hotel",
        type: "Hotel",
        location: "Siem Reap",
        image: "https://picsum.photos/200/200?2",
        amenities: [
          { id: 4, amenity_name: "Spa & Wellness" },
          { id: 5, amenity_name: "Fitness Center" },
        ],
      },
    ],
  };
};