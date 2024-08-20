

    const search_btn = document.getElementById('searchBtnId')
    const mainIndexPage = document.getElementById('mainIndexPage')
    const mainFavoritPage = document.getElementById('mainFavoritPage')
    const searchInput = document.getElementById('search')
    const customAlert = document.getElementById("custom-alert")

    const moviesFromLocalStorage = JSON.parse(localStorage.getItem("myMovies"))
    const favoritMoviesPageId = document.getElementById('favoritMoviesPage')
    
    let myFavoritMovies = moviesFromLocalStorage || []
    
    let add_circle = true;
    
    // Functionality for favoritMovies.html
    if (mainFavoritPage) {
        if (moviesFromLocalStorage) {
            console.log("Type of myFavoritMovies before", typeof(myFavoritMovies))
    
            if (Array.isArray(moviesFromLocalStorage)) {
                myFavoritMovies = myFavoritMovies.concat(moviesFromLocalStorage);
            } else if (moviesFromLocalStorage) {
                myFavoritMovies.push(moviesFromLocalStorage);
            }
            console.log(myFavoritMovies.length)
    
            // Optionally, render movies from local storage if needed
            if (myFavoritMovies.length > 0) {
                // Add logic to display the favorite movies
                    myFavoritMovies.forEach(movieId => {
                        // console.log("Movie: ", movieId)
                        fetchMoviesDetails(movieId, mainFavoritPage, !add_circle)
                        })
                }
            }
    }
    
    if(search_btn) {
        search_btn.addEventListener('click', () => {
            console.log("Search Button Clicked!!")
            mainIndexPage.innerHTML = ''
            fetch(`http://www.omdbapi.com/?&apikey=74d85902&s=${searchInput.value}`)
            .then(res => res.json())
            .then(data => {
                console.log('data.Response = ', data.Response)
                if (data.Response == "True") {
                    data.Search.forEach(id => {
                        fetchMoviesDetails(id.imdbID, mainIndexPage, add_circle)
                    });
                } else {
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
    
    
    
    function fetchMoviesDetails(id, page, addCirle) {
        fetch(`https://www.omdbapi.com/?&apikey=74d85902&i=${id}`)
        .then(res => res.json())
        .then(data => {
            const favoritStr = addCirle ? `
                    <span class="material-symbols-outlined add_circle" data-id="${data.imdbID}">add_circle</span>
                    <p>Watchlist</p>` : ''
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
                         ` + favoritStr +
    `
                    </div>
                    <p>${data.Plot}</p>
                    </div>     
                </div>          
                <div class="divider"></div>
    ` 
            page.innerHTML += htmlStr

    // Attach the add_circle listeners after the movie details are rendered
    if (addCirle) {
        attachAddCircleListeners();
    }
        })
    }
    // ********This is just another way to handle the adding of the Circle Listener function********
    // function attachAddCircleListeners() {
    //     mainIndexPage.addEventListener('click', (event) => {
    //         if (event.target.classList.contains('add_circle')) {
    //             console.log(' Add Circle Clicked')
    //             const movieId = event.target.getAttribute('data-id');
    //             // Check if the movieId is already in the array
    //             if (!myFavoritMovies.includes(movieId)) {
    //                 myFavoritMovies.push(movieId);
    //                 localStorage.setItem("myMovies", JSON.stringify(myFavoritMovies));
    //             }
    //             console.log('Clicked on movie:', movieId);
    //         }
    //     });
    // }
    
    
    function attachAddCircleListeners() {
        // console.log(' Add Circle Function called')
        const addCircleEls = document.getElementsByClassName('add_circle');
        // console.log('Add Circle Els = ', addCircleEls,             'addCircleEls.length =', addCircleEls.length)
        for (let i = 0; i < addCircleEls.length; i++) {
            addCircleEls[i].addEventListener('click', (event) => {
                addCircleEls[i].style.opacity = '0.2'
                const movieId = event.target.getAttribute('data-id');
                // Check if the movieId is already in the array
                if (!myFavoritMovies.includes(movieId)) {
                    // Add the new movieId to the array
                    // console.log('Type of myFavoritMovies:', typeof(myFavoritMovies) );
                    myFavoritMovies.push(movieId);
                    // Save the updated array to localStorage
                    localStorage.setItem("myMovies", JSON.stringify(myFavoritMovies));
                    showCustomAlert(`Movie ID: ${movieId} Added to Favorit`, event.clientX, event.clientY);
                }
                console.log('Clicked on movie:', movieId);
            });
        }
    }


// Function to show custom alert at mouse pointer position
function showCustomAlert(message, x, y) {
    customAlert.textContent = message;
    customAlert.style.left = `${x}px`;
    customAlert.style.top = `${y}px`;
    customAlert.style.display = 'block';
    setTimeout(() => {
        customAlert.style.display = 'none';
    }, 2000); // Hide after 2 seconds
}