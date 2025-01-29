import React, { useState, useEffect } from 'react';

const BASE_URL = "https://fxedsn67te.execute-api.us-east-1.amazonaws.com/dev/synchrony_data_analytics";

// Defines the shape of the data you're expecting to receive
interface Post {
    event_type: string;
    session_id: string;
}

export default function FetchData() {
    // Creates state variables to store the fetched data, loading state, and errors
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch data from the API
                const response = await fetch(`${BASE_URL}`);
                
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Parse the response as JSON
                const data = await response.json();

                // Update the state with the fetched data
                setPosts(data);
            } //catch (error) {
                // Handle any errors that occur during the fetch
                //setError(error.message);
            
                finally {
                // Set loading to false once the fetch is complete
                setLoading(false);
            }
        };

        // Call the fetch function
        fetchPosts();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Display a loading message while data is being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // Display an error message if something went wrong
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Display a message if no data is found
    if (posts.length === 0) {
        return <div>No data available.</div>;
    }

    // Render the fetched data
    return (
        <div>
            {posts.map((post, index) => (
                <div key={index}>
                    <p>Event Type: {post.event_type}</p>
                    <p>Session ID: {post.session_id}</p>
                </div>
            ))}
        </div>
    );
}

//----------------------------------------------------------------------------------------------
//import React from 'react'; 
//import { useState, useEffect } from 'react';


//const BASE_URL = "https://fxedsn67te.execute-api.us-east-1.amazonaws.com/dev/synchrony_data_analytics";

//interface Post {
//  event_type: string;
//  session_id: string;
//}


//export default function FetchData(){
//  const [posts, setPosts] = useState<Post[]>([]);

//  useEffect(() => {
//    const fetchPosts = async () => {
//      const response = await fetch(``${BASE_URL})
//    } 
//  }, []);

//}


// async function fetchData() {
//   try {
//     const response = await fetch(BASE_URL);

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Data fetched successfully:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     throw error;
//   }
// }

// // fetchData();

// // fetchData().then((data) => {
// //     // Process the data here
// //     console.log("Processing Data:", data);
// //   });