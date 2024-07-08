import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_RNgAGeuGRjyhsP8qY77gYToskB1ksyARKqhzBZvJ1tzQTJLa2JPfe6CC2HuRySAg";

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;
/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
//
async function initialLoad() {
  try {
    const response = await axios.get("/breeds");
    const data = response.data;
    //console.log(data);
    data.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
      //<option value="persian">Persian</option>
    });
    //Add a call to this function to the end of your initialLoad function above to create the initial carousel

    if (data) {
      const initialCar = data[0].id;
      await loadCat(initialCar);
    }
  } catch (error) {
    console.error("initialLoad failed", error);
  }
}
initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

breedSelect.addEventListener("change", async () => {
  const breedId = event.target.value;
  //console.log(breedId); //first 4 character:abys
  await loadCat(breedId);
});
async function loadCat(breedId) {
  try {
    const response = await axios.get(
      `https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=${breedId}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
        onDownloadProgress: updateProgress,
      }
    );
    const data = response.data;
    //console.log(data);
    //clear previous img and infodump
    Carousel.clear();
    infoDump.innerHTML = "";

    if (data.length === 0) {
      console.error("No image found");
      infoDump.innerHTML = "<p> No images found for this breed. <p>";
    }

    //add description to infodump
    const breedsData = data[0].breeds[0];
    const desc = document.createElement("div");
    desc.innerHTML = `<h2><b>Breed: </b>${breedsData.name}</h2>
    <p><b>Description: </b>${breedsData.description}</p>
    <p><b>Life Span: </b>${breedsData.life_span}</p>
    <p><b>Origin: </b>${breedsData.origin}</p>
    <p><b>temperament: </b>${breedsData.temperament}</p>`;
    infoDump.appendChild(desc);
    //For each object in the response array, create a new element for the carousel.

    data.forEach((ele) => {
      const newCarouselEle = Carousel.createCarouselItem(
        //imgSrc, imgAlt, imgId
        ele.url,
        ele.breeds[0].name,
        ele.id
      );
      Carousel.appendCarousel(newCarouselEle);
      //console.log(Carousel);
    });
    Carousel.start();
  } catch (error) {
    "Load breed info failed", error;
  }
}

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

// Request interceptor to log the start time and indicate when a request begins
axios.interceptors.request.use(
  (config) => {
    progressBar.style.width = "0%";
    progressBar.classList.remove("hide");
    //show progress cursor
    document.body.style.cursor = "progress";
    // Attach the start time to the config object
    config.metadata = { startTime: new Date() };

    console.log(
      `Starting request to ${config.url} at ${config.metadata.startTime}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to log the duration
axios.interceptors.response.use(
  (response) => {
    // Get the start time from the config object
    const startTime = response.config.metadata.startTime;
    const endTime = new Date();
    const duration = endTime - startTime;
    console.log(`Request to ${response.config.url} completed in ${duration}ms`);
    document.body.style.cursor = "default";
    progressBar.style.width = "100%";
    return response;
  },
  (error) => {
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);

progressBar.addEventListener("transitionend", () => {
  if (progressBar.style.width === "100%") {
    progressBar.style.width = "0%";
    progressBar.classList.add("hide"); // Hide progress bar
  }
});
/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */
// const progressBar = document.getElementById("progressBar");
function updateProgress(event) {
  //console.log(event); // Log the entire ProgressEvent object
  if (event.lengthComputable) {
    const percentCompleted = Math.round((event.loaded * 100) / event.total);
    progressBar.style.width = `${percentCompleted}%`;
    console.log(`Progress: ${percentCompleted}%`);
  } else {
    console.log("Unable to calculate progress: length is not computable");
  }
}
/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
// export async function favourite(imgId) {
//   // your code here
//   try {
//     const response= await axios.
//   } catch (error) {

//   }
// }

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */