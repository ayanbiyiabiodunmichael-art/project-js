document.addEventListener('DOMContentLoaded', function() {
    
    
    if (window.location.pathname.includes('index.html')) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    
    
    if (window.location.pathname.includes('signup.html')) {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }
    }
    
    
    if (window.location.pathname.includes('dashboard.html')) {
        const user = checkAuth();
        if (user) {
            displayUserInfo(user);
            setupDashboard();
        }
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (errorDiv) errorDiv.textContent = '';
    
    if (!email || !password) {
        if (errorDiv) errorDiv.textContent = 'Please fill in all fields!';
        return;
    }

    const btn = document.getElementById('loginBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    
    setTimeout(() => {

        const username = email.includes('@') ? email.split('@')[0] : email;
        const user = {
            username: username,
            email: email,
            profileImage: `https://ui-avatars.com/api/?name=${username}&background=667eea&color=fff&size=150`
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        window.location.href = '/dashboard.html';
    }, 1000);
}

//SIGNUP
async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (errorDiv) errorDiv.textContent = '';
    
    if (!username || !email || !password || !confirmPassword) {
        if (errorDiv) errorDiv.textContent = 'Please fill in all fields!';
        return;
    }
    
    if (password !== confirmPassword) {
        if (errorDiv) errorDiv.textContent = 'Passwords do not match!';
        return;
    }
    
    if (password.length < 6) {
        if (errorDiv) errorDiv.textContent = 'Password must be at least 6 characters!';
        return;
    }
    
    const btn = document.getElementById('signupBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Creating account...';
    btn.disabled = true;


    setTimeout(() => {
        const user = {
            username: username,
            email: email,
            profileImage: `https://ui-avatars.com/api/?name=${username}&background=667eea&color=fff&size=150`
        };
    
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'dummy-token-' + Date.now());
        
        
        if (errorDiv) {
            errorDiv.style.color = '#28a745';
            errorDiv.style.fontWeight = 'bold';
            errorDiv.style.fontSize = '16px';
            errorDiv.textContent = ' Signup Successful!';
        }
        
        btn.textContent = 'Success! Redirecting';
        

        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        
    }, 1000);
}
//CHECK AUTH STATUS
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = '/index.html';
        return null;
    }
    
    return JSON.parse(user);
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('bookmarks');
    window.location.href = '/index.html';
}

function displayUserInfo(user) {
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.innerHTML = `
            <img src="${user.profileImage}" alt="profile" style="width: 35px; height: 35px; border-radius: 50%; margin-right: 10px; object-fit: cover;">
            <span style="margin-right: 15px; font-weight: 500;">${user.username}</span>
            <button onclick="logout()" style="padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Logout</button>
        `;
    }
}

//DASHBOARD
function setupDashboard() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) searchRecipes(query);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) searchRecipes(query);
            }
        });
    }
    
    // Tabs
    const searchTab = document.getElementById('searchTab');
    const bookmarksTab = document.getElementById('bookmarksTab');
    const searchSection = document.getElementById('searchSection');
    const bookmarksSection = document.getElementById('bookmarksSection');
    
    if (searchTab) {
        searchTab.addEventListener('click', () => {
            searchTab.style.color = '#667eea';
            searchTab.style.borderBottom = '3px solid #667eea';
            bookmarksTab.style.color = '#666';
            bookmarksTab.style.borderBottom = 'none';
            searchSection.style.display = 'block';
            bookmarksSection.style.display = 'none';
        });
    }
    
    if (bookmarksTab) {
        bookmarksTab.addEventListener('click', () => {
            bookmarksTab.style.color = '#667eea';
            bookmarksTab.style.borderBottom = '3px solid #667eea';
            searchTab.style.color = '#666';
            searchTab.style.borderBottom = 'none';
            searchSection.style.display = 'none';
            bookmarksSection.style.display = 'block';
            loadBookmarks();
        });
    }
}

//SEARCH RECIPES FROM THEMEALDB
async function searchRecipes(query) {
    const resultsDiv = document.getElementById('resultsContainer');
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 50px;"> Searching...</div>';
    
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        
        if (data.meals) {
            displayRecipes(data.meals);
        } else {
            resultsDiv.innerHTML = '<div style="text-align: center; padding: 50px;"> No recipes found. Try another search!</div>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 50px; color: red;"> Error fetching recipes. Check your internet connection.</div>';
    }
}

// DISPLAY RECIPES 
function displayRecipes(meals) {
    const resultsDiv = document.getElementById('resultsContainer');
    resultsDiv.innerHTML = '';
    
    meals.forEach(meal => {
    
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
                ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
            }
        }
        
        const recipeCard = document.createElement('div');
        recipeCard.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        `;
        
        recipeCard.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 10px;">
                <div style="flex: 1;">
                    <h3 style="margin-top: 0; color: #333;">${meal.strMeal}</h3>
                    <p style="color: #666; margin-bottom: 10px;"><strong>Category:</strong> ${meal.strCategory} | <strong>Area:</strong> ${meal.strArea}</p>
                    <h4 style="margin-bottom: 10px; color: #666;">Ingredients:</h4>
                    <ul style="margin-bottom: 15px; columns: 2;">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                    <h4 style="margin-bottom: 10px; color: #666;">Instructions:</h4>
                    <p style="line-height: 1.6; max-height: 150px; overflow-y: auto;">${meal.strInstructions}</p>
                    <button onclick="bookmarkRecipe('${meal.idMeal}')" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                        Bookmark Recipe
                    </button>
                </div>
            </div>
        `;
        
        resultsDiv.appendChild(recipeCard);
    });
}

//BOOKMARK FUNCTION 
function bookmarkRecipe(mealId) {
    console.log("1. Bookmark function called with mealId:", mealId);
    
    const user = checkAuth();
    console.log("2. User from checkAuth:", user);
    
    if (!user) {
        alert('Please login to bookmark recipes');
        return;
    }

    // Get existing bookmarks
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    console.log("3. Current bookmarks from localStorage:", bookmarks);
    
    // Check if already bookmarked
    if (!bookmarks.includes(mealId)) {
        bookmarks.push(mealId);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        console.log("4. New bookmarks saved:", bookmarks);
        alert(' Recipe bookmarked! Check your Bookmarks tab.');
    } else {
        console.log("4. Recipe already in bookmarks");
        alert(' Recipe already bookmarked!');
    }
}

//LOAD BOOKMARKS
async function loadBookmarks() {
    console.log("5. loadBookmarks function called");
    
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    
    console.log("6. Bookmarks retrieved:", bookmarks);
    
    if (bookmarks.length === 0) {
        console.log("7. No bookmarks found");
        bookmarksContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 50px;">📌 No bookmarks yet. Start saving recipes!</div>';
        return;
    }
    
    bookmarksContainer.innerHTML = '<div style="text-align: center; padding: 50px;">Loading bookmarks...</div>';
    console.log("8. Fetching recipes for bookmark IDs:", bookmarks);
    
    const recipes = [];
    for (let id of bookmarks) {
        try {
            console.log("9. Fetching recipe for ID:", id);
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await response.json();
            console.log("10. API response for ID", id, ":", data);
            
            if (data.meals) {
                recipes.push(data.meals[0]);
                console.log("11. Added recipe:", data.meals[0].strMeal);
            }
        } catch (error) {
            console.error('Error fetching bookmark:', error);
        }
    }
    
    console.log("12. Total recipes fetched:", recipes.length);
    
    if (recipes.length > 0) {
        console.log("13. Displaying bookmarks");
        displayBookmarks(recipes);
    } else {
        console.log("13. No recipes to display");
        bookmarksContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 50px;">❌ Error loading bookmarks</div>';
    }
}

//DISPLAY BOOKMARKS
function displayBookmarks(meals) {
    console.log("14. displayBookmarks called with meals:", meals);
    
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    bookmarksContainer.innerHTML = '';
    
    if (!meals || meals.length === 0) {
        console.log("15. No meals to display");
        bookmarksContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 50px;">No bookmarks to display</div>';
        return;
    }
    
    meals.forEach(meal => {
        console.log("16. Displaying meal:", meal.strMeal);
        
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== '') {
                ingredients.push(`${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}`);
            }
        }
        
        const bookmarkCard = document.createElement('div');
        bookmarkCard.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            position: relative;
        `;
        
        bookmarkCard.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 10px;">
                <div style="flex: 1;">
                    <h3 style="margin-top: 0; color: #333;">${meal.strMeal}</h3>
                    <p style="color: #666; margin-bottom: 10px;"><strong>Category:</strong> ${meal.strCategory} | <strong>Area:</strong> ${meal.strArea}</p>
                    <h4 style="margin-bottom: 10px; color: #666;">Ingredients:</h4>
                    <ul style="margin-bottom: 15px; columns: 2;">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                    <h4 style="margin-bottom: 10px; color: #666;">Instructions:</h4>
                    <p style="line-height: 1.6; max-height: 150px; overflow-y: auto;">${meal.strInstructions}</p>
                    <button onclick="removeBookmark('${meal.idMeal}')" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    Remove Bookmark
                    </button>
                </div>
            </div>
        `;
        
        bookmarksContainer.appendChild(bookmarkCard);
    });
    
    console.log("17. Finished displaying bookmarks");
}

function removeBookmark(mealId) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bookmarks = bookmarks.filter(id => id !== mealId);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    alert('Bookmark removed!');
    loadBookmarks();
}

window.logout = logout;
window.bookmarkRecipe = bookmarkRecipe;  
window.removeBookmark = removeBookmark;