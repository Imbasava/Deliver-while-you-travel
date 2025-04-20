import React, { useState, useEffect } from "react";

export const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    aadhar: "",
    age: "",
    photo: null,
    photoPreview: null,
  });

  useEffect(() => {
    const fetchProfileAndSenderId = async () => {
      // --- Fetch Profile Data (Existing Logic) ---
      try {
        const profileResponse = await fetch("http://localhost:8080/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        let profileData = null; // Store profile data temporarily

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log("Profile data:", profileData);

          // Save user_id from profile into localStorage AS travelerId (based on your existing logic)
          // Note: Ensure this user_id IS the travelerId you expect
          if (profileData.user_id) {
             console.log("Setting travelerId from profile data:", profileData.user_id);
             localStorage.setItem("travelerId", profileData.user_id);
          }

          // Set profile state
          setProfile({
            name: localStorage.getItem("firstName") || "", // Use name from localStorage as fallback
            aadhar: profileData.aadhar || "",
            age: profileData.age || "",
            photo: null, // Don't set file object here
            photoPreview: profileData.photo
              ? profileData.photo.startsWith("http")
                ? profileData.photo
                : `http://localhost:8080/${profileData.photo}`
              : null,
          });

        } else {
          console.error("Failed to fetch profile:", profileResponse.status);
          // Set name from local storage if profile fetch fails but user might be logged in
          setProfile((prev) => ({
            ...prev,
            name: localStorage.getItem("firstName") || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Set name from local storage as fallback on error
         setProfile((prev) => ({
           ...prev,
           name: localStorage.getItem("firstName") || "",
         }));
      }

      // --- Fetch Sender ID using travelerId (New Logic) ---
      const travelerId = localStorage.getItem("travelerId"); // Get travelerId (potentially set above)

      if (travelerId) {
        console.log("Attempting to fetch senderId using travelerId:", travelerId);
        try {
          // Call the new backend endpoint
          const senderResponse = await fetch(`http://localhost:8080/api/bookings/sender/${travelerId}`);

          if (senderResponse.ok) {
            const senderData = await senderResponse.json(); // Expects {"senderId": 123}
            if (senderData && senderData.senderId) {
              // Store the fetched userId AS senderId in localStorage
              localStorage.setItem('senderId', senderData.senderId);
              console.log("Stored senderId in localStorage:", senderData.senderId);
            } else {
               console.warn("Response from /api/bookings/sender/ was OK but did not contain senderId.", senderData);
               // Handle case where backend logic might not find a senderId even if booking exists
               // Maybe clear any old senderId? localStorage.removeItem('senderId');
            }
          } else {
             // Handle HTTP errors (like 404 Not Found if no booking exists for travelerId)
             const errorText = await senderResponse.text();
             console.error(`Failed to fetch senderId (HTTP ${senderResponse.status}):`, errorText);
             // Optionally clear any old senderId if fetch fails
             // localStorage.removeItem('senderId');
          }
        } catch (error) {
          console.error("Error during fetch senderId request:", error);
          // Optionally clear any old senderId on network errors
          // localStorage.removeItem('senderId');
        }
      } else {
          console.warn("travelerId not found in localStorage after profile fetch, cannot fetch senderId.");
          // Optionally clear any old senderId if travelerId is missing
          // localStorage.removeItem('senderId');
      }
    };

    fetchProfileAndSenderId(); // Call the combined async function

  }, []); // Empty dependency array ensures it runs once on mount

  // --- Existing handlers (handleChange, handleFileChange, handleSubmit) ---
   const handleChange = (e) => {
     setProfile({ ...profile, [e.target.name]: e.target.value });
   };

   const handleFileChange = (e) => {
     const file = e.target.files[0];
     if (file) {
         setProfile({
           ...profile,
           photo: file,
           photoPreview: URL.createObjectURL(file),
         });
     }
   };

   const handleSubmit = async (e) => {
     e.preventDefault();

     const formData = new FormData();
     formData.append("aadhar", profile.aadhar);
     formData.append("age", profile.age);
     // Only append photo if a new one was selected
     if (profile.photo instanceof File) {
        formData.append("photo", profile.photo);
     }


     try {
       const response = await fetch("http://localhost:8080/api/users/profile", {
         method: "POST", // Should this be PUT for update? Check your user profile endpoint logic
         headers: {
           Authorization: `Bearer ${localStorage.getItem("token")}`,
           // Don't set Content-Type for FormData, browser does it
         },
         body: formData,
       });

       if (response.ok) {
         alert("Profile updated successfully!");
         // Optionally, refetch the profile to get the latest data including potentially new photo URL
         const updatedProfile = await response.json();
         // Update photo preview if backend returns new path
          if (updatedProfile.photo) {
            setProfile(prev => ({
                ...prev,
                photoPreview: updatedProfile.photo.startsWith("http")
                  ? updatedProfile.photo
                  : `http://localhost:8080/${updatedProfile.photo}`,
                photo: null // Clear the file input state
            }));
          }
         // Note: The travelerId is likely set on initial load, maybe no need to reset here unless profile update changes it
         // if (updatedProfile.user_id) {
         //   localStorage.setItem("travelerId", updatedProfile.user_id);
         // }
       } else {
         const errorData = await response.text();
         console.error("Error updating profile:", response.status, errorData)
         alert(`Error updating profile: ${errorData || response.statusText}`);
       }
     } catch (error) {
       console.error("Error submitting profile update:", error);
       alert("An error occurred while updating the profile.")
     }
   };

  // --- Existing JSX ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {profile.aadhar ? "Edit Profile" : "Create Profile"}
        </h1>

        {profile.photoPreview && (
          <div className="flex justify-center mb-4">
            <img
              src={profile.photoPreview}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-md object-cover" // Added object-cover
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              value={profile.name}
              disabled
              readOnly // Better than disabled for accessibility if just displaying
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700 focus:outline-none" // Adjusted focus/text color
            />
          </div>

          <div>
            <label htmlFor="aadhar" className="block text-sm font-medium text-gray-600">
              Aadhar Number
            </label>
            <input
              id="aadhar"
              type="text"
              name="aadhar"
              value={profile.aadhar}
              onChange={handleChange}
              required
              pattern="\d{12}" // Basic Aadhar pattern (12 digits) - adjust if needed
              title="Aadhar number must be 12 digits"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent" // Enhanced focus
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-600">Age</label>
            <input
              id="age"
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              required
              min="1" // Basic validation
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent" // Enhanced focus
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-600">
              Upload Photo
            </label>
            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/png, image/jpeg, image/jpg" // Be specific
              onChange={handleFileChange}
              // Make required only if there's no existing photo preview
              required={!profile.photoPreview}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400" // Added focus style
            />
             {!profile.photoPreview && (
                <p className="text-xs text-gray-500 mt-1">Photo is required for new profiles.</p>
             )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out" // Enhanced styles
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};