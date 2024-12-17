import React, { useEffect, useState } from "react";
import axios from "axios";

const Tushar = () => {
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTokenFetched, setIsTokenFetched] = useState(false); 
  const fetchToken = async () => {
    try {
      const params = new URLSearchParams({
        username: "MedicareMember",
        password: "MedicareMember@123",
      }).toString();

      const response = await axios.post(
        `https://api.medicare.takshit.com/api/app/v1/generate-token?${params}`
      );
      if (response.data.status) {
        const fetchedToken = response.data.data;
        const expiryTime = Date.now() + 2 * 60 * 1000;
        sessionStorage.setItem(
          "token",
          JSON.stringify({ value: fetchedToken, expiry: expiryTime })
        );
        setIsTokenFetched(true);
        console.log("Token fetched successfully:", fetchedToken);
      } else {
        throw new Error("Token generation failed");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      setError("Failed to fetch token. Please try again later.");
    }
  };
  const fetchClinicByCode = async () => {
    try {
      const storedToken = sessionStorage.getItem("token");

      if (!storedToken) {
        console.error("Token not found. Fetching a new token...");
        await fetchToken();
        return;
      }

      const { value, expiry } = JSON.parse(storedToken);
      if (Date.now() > expiry) {
        console.error("Token expired. Fetching a new token...");
        await fetchToken();
        return;
      }
      const response = await axios.post(
        "https://api.medicare.takshit.com/api/app/v1/get-clinic-by-code",
        { SearchValue: "Lalmohan" },
        {
          headers: {
            Authorization: `Bearer ${value}`,
          },
        }
      );

      if (response.data.HospitalData) {
        setClinicData(response.data.HospitalData);
        setLoading(false); // Data fetched, stop loading
        console.log("Clinic data fetched successfully:", response.data.HospitalData);
      } else {
        setError("No clinic data available.");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError("Error fetching clinic data. Please try again later.");
      console.error("Error fetching clinic data:", error);
    }
  };

  useEffect(() => {
    if (isTokenFetched) {
      fetchClinicByCode();
    } else {
      fetchClinicByCode();
    }
  }, [isTokenFetched]); 

  return (
    <div className=" bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Clinic Data</h1>
    {loading ? (
      <div className="flex justify-center items-center space-x-2">
        <div className="animate-spin rounded-full border-t-4 border-blue-500 w-10 h-10"></div>
        <p className="text-gray-700">Loading...</p>
      </div>
    ) : error ? (
      <p className="text-red-500 text-center">{error}</p>
    ) : (
      <div>
        {clinicData && clinicData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {clinicData.map((clinic, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6 text-center">
                  <img
                    src={clinic.LOGO}
                    alt={clinic.NAME}
                    className="w-32 h-32 object-contain mx-auto mb-4 rounded-full border-2 border-blue-500"
                  />
                  <h2 className="text-xl font-semibold text-gray-900">{clinic.NAME}</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p><strong>Location:</strong> {clinic.CITY}, {clinic.STATE}, {clinic.COUNTRY}</p>
                  <p><strong>Email:</strong> <span className="text-blue-600">{clinic.EMAILID}</span></p>
                  <p><strong>Contact:</strong> {clinic.CONTACTNO}</p>
                  <p><strong>Package:</strong> {clinic.PACKAGENAME}</p>
                  <p><strong>Package Amount:</strong> ₹{clinic.PACKAGEAMOUNT}</p>
                  <p><strong>Number of Beds:</strong> {clinic.NOOFBED}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No clinic data available.</p>
        )}
      </div>
    )}
  </div>  
  );
};

export default Tushar;
