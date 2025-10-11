// ==========================================
// MOVIE WATCHLIST APPLICATION
// ==========================================
// This application allows users to search for movies using the OMDB API
// and manage a personal watchlist stored in browser's localStorage

// ==========================================
// DOM ELEMENT REFERENCES
// ==========================================
// Grabbing references to key DOM elements that we'll interact with
const search_btn = document.getElementById('searchBtnId') // Search button on index.html
const mainIndexPage = document.getElementById('mainIndexPage') // Main content area for search results
const mainFavoritPage = document.getElementById('mainFavoritPage') // Main content area for watchlist page
const searchInput = document.getElementById('search') // Search input field
const customAlert = document.getElementById("custom-alert") // Custom alert element (currently unused)

// ==========================================
// LOCAL STORAGE MANAGEMENT
// ==========================================
// Retrieve saved movies from localStorage
// localStorage stores data as strings, so we use JSON.parse() to convert back to an array
const moviesFromLocalStorage = JSON.parse(localStorage.getItem("myMovies"))

// Reference to the watchlist link (currently unused but available for future enhancements)
const favoritMoviesPageId = document.getElementById('favoritMoviesPage')

// ==========================================
// APPLICATION STATE
// ==========================================
// Initialize the watchlist array
// If there are movies in localStorage, use them; otherwise, start with an empty array
let myFavoritMovies = moviesFromLocalStorage || []

// Flag to determine which icon to show (add_circle for search page, remove_circle for watchlist page)
let add_circle = true;

// ==========================================
// WATCHLIST PAGE LOGIC (favoritMovies.html)
// ==========================================
// This block only runs when we're on the watchlist page
if (mainFavoritPage) {
    // Check if there are any saved movies in localStorage
    if (moviesFromLocalStorage) {
        // If we have movies in the watchlist, display them
        if (myFavoritMovies.length > 0) {
            // Loop through each movie ID and fetch its details from the API
            myFavoritMovies.forEach(movieId => {
                // Pass false for add_circle to show "remove" button instead of "add"
                fetchMoviesDetails(movieId, mainFavoritPage, !add_circle)
            })
        }
    }
}

// ==========================================
// SEARCH FUNCTIONALITY (index.html)
// ==========================================
// This block only runs when we're on the search page (where search_btn exists)
if(search_btn) {
    // Add click event listener to the search button
    search_btn.addEventListener('click', () => {
        // Clear previous search results before displaying new ones
        mainIndexPage.innerHTML = ''
        
        // Make API call to OMDB API
        // API Key: 74d85902
        // 's' parameter searches for movies by title
        fetch(`https://www.omdbapi.com/?&apikey=74d85902&s=${searchInput.value}`)
            .then(res => res.json()) // Convert response to JSON
            .then(data => {
                // Check if the API returned successful results
                if (data.Response == "True") {
                    // Loop through each movie in the search results
                    data.Search.forEach(id => {
                        // Fetch detailed information for each movie using its IMDB ID
                        fetchMoviesDetails(id.imdbID, mainIndexPage, add_circle)
                    });
                } else {
                    // If no movies found, clear localStorage (questionable choice - might not be desired)
                    localStorage.clear();
                    
                    // Display "No Movie Found" message
                    mainIndexPage.innerHTML = 
                    `<div class="container">
                        <div class="title-time-desc">
                            <div class="title">
                                <h1>No Movie Found </h1>
                            </div>
                        </div>     
                    </div>          
                    <div class="divider"></div>`;
                }   
            })
    })
}

// ==========================================
// FETCH MOVIE DETAILS FROM OMDB API
// ==========================================
/**
 * Fetches detailed movie information from OMDB API and renders it to the page
 * @param {string} id - The IMDB ID of the movie
 * @param {HTMLElement} page - The DOM element to append the movie HTML to
 * @param {boolean} addCirle - Whether to show "add to watchlist" (true) or "remove" (false) button
 */
function fetchMoviesDetails(id, page, addCirle) {
    // Fetch movie details using IMDB ID
    // 'i' parameter gets a specific movie by ID
    fetch(`https://www.omdbapi.com/?&apikey=74d85902&i=${id}`)
        .then(res => res.json())
        .then(data => {
            // Conditional rendering: show different buttons based on which page we're on
            const favoritStr = addCirle ? 
                // "Add to Watchlist" button for search page
                `<span class="material-symbols-outlined add_circle" data-id="${data.imdbID}">add_circle</span>
                <p>Watchlist</p>` :  
                // "Remove" button for watchlist page
                `<span class="material-symbols-outlined remove_circle" data-id="${data.imdbID}">remove_circle</span>
                <p>Remove</p>`
            
            // Build the HTML string for displaying movie information
            let htmlStr = `<div class="container">
                <img src="${data.Poster}" alt="${data.Title}">
                <div class="title-time-desc">
                    <div class="title">
                        <h1>${data.Title}</h1>
                        <span class="material-symbols-outlined star_rate">star_rate</span>
                        <h2>${data.imdbRating}</h2>
                    </div> 
                    <div class="time">
                        <h3>${data.Runtime}</h3>
                        <p>${data.Type}</p>
                        ` + favoritStr + `
                    </div>
                    <p>${data.Plot}</p>
                </div>     
            </div>          
            <div class="divider"></div>`
            
            // Append the movie HTML to the page
            page.innerHTML += htmlStr

            // Attach appropriate event listeners after rendering
            if (addCirle) {
                attachAddCircleListeners(); // For adding movies to watchlist
            } else {
                attachRemoveCircleListeners(); // For removing movies from watchlist
            }
        })
}

// ==========================================
// ALTERNATIVE IMPLEMENTATION (COMMENTED OUT)
// ==========================================
// This shows an alternative approach using event delegation
// Event delegation attaches one listener to a parent element instead of multiple listeners
// This is more efficient when dealing with many dynamically created elements
/*
function attachRemoveCircleListeners() {
    mainFavoritPage.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove_circle')) {
            console.log('Remove Circle Clicked')
            const movieId = event.target.getAttribute('data-id');
            // Find and remove the movie from the array
            const index = myFavoritMovies.indexOf(movieId);
            if (index > -1) {
                myFavoritMovies.splice(index, 1);
            }
            // Update localStorage
            localStorage.setItem("myMovies", JSON.stringify(myFavoritMovies));
            console.log('Clicked on movie:', movieId);
        }
    });
}
*/

// ==========================================
// ADD TO WATCHLIST FUNCTIONALITY
// ==========================================
/**
 * Attaches click event listeners to all "add to watchlist" buttons
 * Uses getElementsByClassName which returns a live HTMLCollection
 * Note: This function is called multiple times (after each movie is rendered)
 * which could lead to duplicate event listeners - a potential bug!
 */
function attachAddCircleListeners() {
    // Get all elements with the 'add_circle' class
    const addCircleEls = document.getElementsByClassName('add_circle');
    
    // Loop through each button and attach a click listener
    for (let i = 0; i < addCircleEls.length; i++) {
        addCircleEls[i].addEventListener('click', (event) => {
            // Visual feedback: reduce opacity when clicked
            addCircleEls[i].style.opacity = '0.2'
            
            // Get the movie ID from the data-id attribute
            const movieId = event.target.getAttribute('data-id');
            
            // Check if movie is already in watchlist to avoid duplicates
            if (!myFavoritMovies.includes(movieId)) {
                // Add movie ID to the watchlist array
                myFavoritMovies.push(movieId);
                
                // Persist the updated watchlist to localStorage
                // JSON.stringify converts the array to a string for storage
                localStorage.setItem("myMovies", JSON.stringify(myFavoritMovies));
            }
        });
    }
}

// ==========================================
// REMOVE FROM WATCHLIST FUNCTIONALITY
// ==========================================
/**
 * Attaches click event listeners to all "remove from watchlist" buttons
 * Similar structure to attachAddCircleListeners but handles removal
 */
function attachRemoveCircleListeners() {
    // Get all elements with the 'remove_circle' class
    const removeCircleEls = document.getElementsByClassName('remove_circle');
    
    // Loop through each button and attach a click listener
    for (let i = 0; i < removeCircleEls.length; i++) {
        removeCircleEls[i].addEventListener('click', (event) => {
            // Visual feedback: reduce opacity when clicked
            removeCircleEls[i].style.opacity = '0.2'
            
            // Get the movie ID from the data-id attribute
            const movieId = event.target.getAttribute('data-id');
            
            // Check if the movie exists in the watchlist
            if (myFavoritMovies.includes(movieId)) {
                // Find the index of the movie in the array
                const index = myFavoritMovies.indexOf(movieId);
                
                if (index > -1) {
                    // Remove the movie from the array
                    // splice(index, 1) removes 1 element at the specified index
                    myFavoritMovies.splice(index, 1);
                    
                    // Reload the page to refresh the watchlist display
                    // Note: This is a simple but not ideal solution - a more elegant
                    // approach would be to remove the DOM element directly
                    location.reload()
                }
                
                // Update localStorage with the modified watchlist
                localStorage.setItem("myMovies", JSON.stringify(myFavoritMovies));
            }
        });
    }
}

// ==========================================
// CUSTOM ALERT FUNCTIONALITY (CURRENTLY UNUSED)
// ==========================================
// This code is commented out but shows an alternative to browser's alert()
// Could be used to show confirmation messages when adding/removing movies
/*
function showCustomAlert(message, x, y) {
    customAlert.textContent = message;
    customAlert.style.left = `${x}px`;
    customAlert.style.top = `${y}px`;
    customAlert.style.display = 'block';
    setTimeout(() => {
        customAlert.style.display = 'none';
    }, 2000); // Hide after 2 seconds
}
*/