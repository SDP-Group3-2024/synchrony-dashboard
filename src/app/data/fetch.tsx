const BASE_URL = "https://fxedsn67te.execute-api.us-east-1.amazonaws.com/dev/synchrony_data_analytics";

interface Post {
  event_type: string;
  session_id: string;
}


export default function FetchData(){
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(``${BASE_URL})
    } 
  }, []);

}


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