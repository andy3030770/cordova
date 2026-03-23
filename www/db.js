/**
 * Database initialization and core operations
 * Dependencies: cordova-sqlite-storage plugin
 */
let db;
document.addEventListener("deviceready", initDatabase, false);

/**
 * Initialize SQLite database and create tables (users + favorites)
 */
function initDatabase() {
    // Check if Cordova is ready (critical for SQLite plugin)
    if (!window.cordova) {
        // Fallback for browser testing (Web SQL)
        db = window.openDatabase("SchoolAppDB", "1.0", "School Application Database", 2 * 1024 * 1024);
    } else {
        // Native SQLite for mobile platforms
        db = window.sqlitePlugin.openDatabase({
            name: "SchoolAppDB.db",
            location: "default",
            androidDatabaseProvider: "system"
        });
    }

    // Create users table (id, username, password, create_time)
    db.transaction(function (tx) {
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "username VARCHAR(50) UNIQUE NOT NULL," +
            "password VARCHAR(255) NOT NULL," +
            "create_time DATETIME DEFAULT CURRENT_TIMESTAMP)"
        );

        // Create favorites table (bind to user ID)
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS school_favorites (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "user_id INTEGER NOT NULL," +
            "school_name VARCHAR(100) NOT NULL," +
            "school_address VARCHAR(255)," +
            "favorite_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
            "FOREIGN KEY (user_id) REFERENCES users(id))"
        );
    }, function (error) {
        console.error("Database table creation failed: " + error.message);
    }, function () {
        console.log("Database initialized successfully (users + favorites tables created)");
    });
}

/**
 * Register new user (async)
 * @param {string} username - User input username
 * @param {string} password - User input password
 * @returns {Promise} - Resolve with success, reject with error
 */
function registerUser(username, password) {
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            // Check if username exists
            tx.executeSql(
                "SELECT * FROM users WHERE username = ?",
                [username],
                function (tx, result) {
                    if (result.rows.length > 0) {
                        reject("Username already exists!");
                    } else {
                        // Insert new user (password can be hashed in production)
                        tx.executeSql(
                            "INSERT INTO users (username, password) VALUES (?, ?)",
                            [username, password],
                            function (tx, result) {
                                resolve("Registration successful! Please login.");
                            },
                            function (tx, error) {
                                reject("Registration failed: " + error.message);
                            }
                        );
                    }
                }
            );
        });
    });
}

/**
 * User login (async)
 * @param {string} username - User input username
 * @param {string} password - User input password
 * @returns {Promise} - Resolve with user info, reject with error
 */
function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql(
                "SELECT * FROM users WHERE username = ? AND password = ?",
                [username, password],
                function (tx, result) {
                    if (result.rows.length === 0) {
                        reject("Invalid username or password!");
                    } else {
                        // Save login state to LocalStorage
                        const user = result.rows.item(0);
                        localStorage.setItem("loggedIn", "true");
                        localStorage.setItem("currentUserId", user.id);
                        localStorage.setItem("currentUsername", user.username);
                        resolve("Login successful!");
                    }
                },
                function (tx, error) {
                    reject("Login failed: " + error.message);
                }
            );
        });
    });
}

/**
 * Logout user (clear state)
 */
function logoutUser() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUsername");
    // Redirect to login page
    window.location.href = "index.html";
}

/**
 * Add school to favorites (only for logged-in users)
 * @param {string} schoolName - Name of the school to favorite
 * @param {string} schoolAddress - Address of the school (optional)
 * @returns {Promise} - Resolve with success, reject with error
 */
function addFavoriteSchool(schoolName, schoolAddress) {
    return new Promise((resolve, reject) => {
        // Check login state
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        const userId = localStorage.getItem("currentUserId");
        if (!isLoggedIn || !userId) {
            reject("Please login first to add favorites!");
            return;
        }

        // Check if school is already favorited by user
        db.transaction(function (tx) {
            tx.executeSql(
                "SELECT * FROM school_favorites WHERE user_id = ? AND school_name = ?",
                [userId, schoolName],
                function (tx, result) {
                    if (result.rows.length > 0) {
                        reject("This school is already in your favorites!");
                    } else {
                        // Insert favorite record
                        tx.executeSql(
                            "INSERT INTO school_favorites (user_id, school_name, school_address) VALUES (?, ?, ?)",
                            [userId, schoolName, schoolAddress],
                            function (tx, result) {
                                resolve("School added to favorites!");
                            },
                            function (tx, error) {
                                reject("Failed to add favorite: " + error.message);
                            }
                        );
                    }
                }
            );
        });
    });
}

/**
 * Get all favorite schools of current user
 * @returns {Promise} - Resolve with array of favorites, reject with error
 */
function getFavoriteSchools() {
    return new Promise((resolve, reject) => {
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        const userId = localStorage.getItem("currentUserId");
        if (!isLoggedIn || !userId) {
            reject("Please login first to view favorites!");
            return;
        }

        db.transaction(function (tx) {
            tx.executeSql(
                "SELECT * FROM school_favorites WHERE user_id = ? ORDER BY favorite_time DESC",
                [userId],
                function (tx, result) {
                    const favorites = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        favorites.push(result.rows.item(i));
                    }
                    resolve(favorites);
                },
                function (tx, error) {
                    reject("Failed to get favorites: " + error.message);
                }
            );
        });
    });
}

/**
 * Remove school from favorites
 * @param {number} favoriteId - ID of the favorite record
 * @returns {Promise} - Resolve with success, reject with error
 */
function removeFavoriteSchool(favoriteId) {
    return new Promise((resolve, reject) => {
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        if (!isLoggedIn) {
            reject("Please login first to remove favorites!");
            return;
        }

        db.transaction(function (tx) {
            tx.executeSql(
                "DELETE FROM school_favorites WHERE id = ?",
                [favoriteId],
                function (tx, result) {
                    resolve("School removed from favorites!");
                },
                function (tx, error) {
                    reject("Failed to remove favorite: " + error.message);
                }
            );
        });
    });
}