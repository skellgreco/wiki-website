// This object will hold the announcements in different categories
let announcements = {
    "pinned": [],
    "important": [],
    "tutorials": [],
    "updates": [],
    "issues": [],
    "other": []
};

// Replace with your actual password
const adminPassword = "YOUR_ADMIN_PASSWORD";

// Track if the admin form is open
let isAdminFormOpen = false;

// Track the announcement being edited
let editingAnnouncement = null;

// Load the announcements from the server on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchAnnouncements();
});

function fetchAnnouncements() {
    fetch('/announcements.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            announcements = data;
            loadAnnouncements();
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            alert('Failed to load announcements.');
        });
}

function loadAnnouncements() {
    const categories = Object.keys(announcements);

    // Clear existing content
    categories.forEach(category => {
        const container = document.getElementById(category);
        if (container) {
            container.innerHTML = `<h2>${getCategoryLabel(category)}</h2>`; // Set category label
        }
    });

    // Handle pinned announcements separately
    const importantPinnedContainer = document.getElementById('pinned');
    if (announcements['pinned'].length > 0) {
        importantPinnedContainer.style.display = 'block';
        createAnnouncementElement(announcements['pinned'][0], 'pinned', importantPinnedContainer);
    } else {
        importantPinnedContainer.style.display = 'none';
    }

    // Load other categories
    categories.forEach(category => {
        if (category !== 'pinned') {
            const container = document.getElementById(category);
            if (container) {
                const sortedPosts = announcements[category].sort((a, b) => new Date(b.date) - new Date(a.date));
                const postsToShow = sortedPosts.slice(0, 3); // Initial posts to show
                const allPosts = sortedPosts;

                // Display the initial set of posts
                postsToShow.forEach((announcement) => {
                    createAnnouncementElement(announcement, category, container);
                });

                // Show More button logic
                if (allPosts.length > 3) {
                    const button = document.createElement('button');
                    button.id = `show-more-${category}`;
                    button.className = 'show-more-button';
                    button.textContent = 'Show More';

                    // Track the current state
                    let showingMore = false;

                    button.onclick = () => {
                        if (showingMore) {
                            // Show initial posts when "Show Less" is clicked
                            container.innerHTML = `<h2>${getCategoryLabel(category)}</h2>`;
                            allPosts.slice(0, 3).forEach((announcement) => {
                                createAnnouncementElement(announcement, category, container);
                            });
                            button.textContent = 'Show More';
                            showingMore = false;
                        } else {
                            // Show all posts when "Show More" is clicked
                            const newPostsToShow = allPosts.slice(0);
                            container.innerHTML = `<h2>${getCategoryLabel(category)}</h2>`;
                            newPostsToShow.forEach((announcement) => {
                                createAnnouncementElement(announcement, category, container);
                            });
                            button.textContent = 'Show Less';
                            showingMore = true;
                        }

                        // Ensure the button stays at the bottom
                        container.appendChild(button);
                    };

                    // Append the Show More button at the bottom
                    container.appendChild(button);
                }
            }
        }
    });

    // Update button visibility based on admin form state
    document.querySelectorAll('.edit-button').forEach(button => {
        button.style.display = isAdminFormOpen ? 'block' : 'none';
    });
    document.querySelectorAll('.delete-button').forEach(button => {
        button.style.display = isAdminFormOpen ? 'block' : 'none';
    });
}




function createAnnouncementElement(announcement, category, container) {
    const announcementDiv = document.createElement("div");
    announcementDiv.className = "announcement";

    // Create the title element as a link
    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = `announcement.html?id=${announcement.id}&category=${category}`;
    titleLink.textContent = announcement.title;
    titleLink.style.color = "#b3b3b3";
    title.appendChild(titleLink);

    // Create the content element
    const content = document.createElement("p");
    content.innerHTML = formatContent(announcement.content);
    content.style.display = "none";

    // Create the date element
    const date = document.createElement("span");
    date.className = "announcement-date";
    date.textContent = `Posted on: ${formatDate(announcement.date)}`;

    // Create the Show More button
    const showMoreButton = document.createElement("button");
    showMoreButton.className = "show-more-content-button";
    showMoreButton.textContent = "Click to Read More";
    showMoreButton.onclick = () => {
        if (content.style.display === "none") {
            content.style.display = "block";
            showMoreButton.textContent = "Click to Read Less";
        } else {
            content.style.display = "none";
            showMoreButton.textContent = "Click to Read More";
        }
    };

    // Create the Edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-button"; // Apply edit-button class
    editButton.style.display = isAdminFormOpen ? "block" : "none";
    editButton.setAttribute("data-category", category);
    editButton.setAttribute("data-id", announcement.id); // Use data-id
    editButton.onclick = () => {
        if (isAdminFormOpen) {
            document.getElementById('admin-form').style.display = 'block';
            document.getElementById('announcement-title').value = announcement.title;
            document.getElementById('announcement-content').value = announcement.content;
            document.getElementById('announcement-category').value = category;
            editingAnnouncement = { id: announcement.id, category };
        }
    };

    // Create the Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button"; // Apply delete-button class
    deleteButton.style.display = isAdminFormOpen ? "block" : "none";
    deleteButton.setAttribute("data-category", category);
    deleteButton.setAttribute("data-id", announcement.id); // Use data-id
    deleteButton.onclick = () => {
        if (prompt("Enter admin password:") === adminPassword) {
            deleteAnnouncement(deleteButton.getAttribute("data-category"), deleteButton.getAttribute("data-id")); // Use data-id
        } else {
            alert("Incorrect password!");
        }
    };

    // Append all elements to the announcement div
    announcementDiv.appendChild(title);
    announcementDiv.appendChild(content);
    announcementDiv.appendChild(date);
    announcementDiv.appendChild(showMoreButton);
    announcementDiv.appendChild(editButton); // Add Edit button
    announcementDiv.appendChild(deleteButton); // Add Delete button
    container.appendChild(announcementDiv);

    console.log('Announcement element created:', announcementDiv); // Log created element
}


// Prompt user for password and then execute the action
function requestPasswordForAction(action, data) {
    const password = prompt("Enter 2FA Password:");
    if (password === null) return; // User canceled

    fetch('/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(authData => {
        if (authData.success) {
            data.token = authData.token; // Add token to data
            action(data);
        } else {
            alert("Incorrect password!");
        }
    })
    .catch(error => console.error('Error authenticating:', error));
}

// Posting an announcement
function postAnnouncement() {
    const title = document.getElementById('announcement-title').value;
    const content = document.getElementById('announcement-content').value;
    const category = document.getElementById('announcement-category').value;

    if (title.trim() === "" || content.trim() === "") {
        alert("Title and Content cannot be empty!");
        return;
    }

    const date = new Date().toISOString(); // Current date and time

    const payload = { 
        title, 
        content, 
        date, 
        category, 
        id: editingAnnouncement ? editingAnnouncement.id : crypto.randomUUID()
    };

    requestPasswordForAction((data) => {
        fetch(editingAnnouncement ? '/edit-announcement' : '/post-announcement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}` // Send token in header
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('admin-password').value = "";
                document.getElementById('announcement-title').value = "";
                document.getElementById('announcement-content').value = "";
                fetchAnnouncements();
                alert(editingAnnouncement ? "Announcement Edited Successfully!" : "Announcement Posted Successfully!");
                editingAnnouncement = null;
            } else {
                alert("Failed to post or edit announcement.");
            }
        })
        .catch(error => console.error('Error posting or editing announcement:', error));
    }, payload);
}

// Deleting an announcement
function deleteAnnouncement(category, id) {
    requestPasswordForAction((data) => {
        fetch('/delete-announcement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}` // Send token in header
            },
            body: JSON.stringify({ category, id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchAnnouncements();
            } else {
                alert("Failed to delete announcement.");
            }
        })
        .catch(error => console.error('Error deleting announcement:', error));
    }, { category, id });
}



// Detect secret key press sequence to show admin form
let keySequence = [];
const secretSequence = ['e','d','i','t','c','o','n','s','o','l','e'];

document.addEventListener('keydown', (event) => {
    keySequence.push(event.key);
    if (keySequence.length > secretSequence.length) {
        keySequence.shift();
    }
    if (keySequence.join('') === secretSequence.join('')) {
        document.getElementById('admin-form').style.display = 'block';
        isAdminFormOpen = true;
        loadAnnouncements();  // Reload announcements to show delete buttons
    }
});

// Close admin form
document.getElementById('close-admin-form').onclick = () => {
    document.getElementById('admin-form').style.display = 'none';
    isAdminFormOpen = false;
    loadAnnouncements();  // Reload announcements to hide delete buttons
};

// Get category label based on category name
function getCategoryLabel(category) {
    const labels = {
        "pinned": "Pinned Announcement",
        "important": "🔥 Important",
        "tutorials": "Tutorials",
        "updates": "Updates",
        "issues": "Issues",
        "other": "Other"
    };
    return labels[category] || category;
}

// Format the content
function formatContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/`(.*?)`/g, '<code>$1</code>') // Code
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>') // Quote
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^- (.*$)/gim, '   • $1')
        .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+(?:\?[^\s)]+)?)\)/g, '<img src="$2" alt="$1" style="max-width: 50%; height: auto;">') // Image
        .replace(/(https?:\/\/[^\s]+(?:\?[^\s]*)?\.(?:png|jpg|jpeg|gif|webp))/g, '<img src="$1" style="max-width: 100%; height: auto;">') // Direct URLs
        
        .replace(/\n/g, '<br>'); // Ensure single line breaks are handled
        
}

// Format the date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to filter announcements based on search input
function searchAnnouncements() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    // Clear existing announcements
    Object.keys(announcements).forEach(category => {
        const container = document.getElementById(category);
        if (container) {
            container.innerHTML = `<h2>${getCategoryLabel(category)}</h2>`;
        }
    });

    let resultsFound = false;

    // Filter and display announcements
    Object.keys(announcements).forEach(category => {
        announcements[category].forEach(announcement => {
            if (announcement.title.toLowerCase().includes(searchTerm)) {
                const container = document.getElementById(category);
                createAnnouncementElement(announcement, category, container);
                resultsFound = true;
            }
        });
    });

    
}

// Function to clear the search input and reload all announcements
function clearSearch() {
    document.getElementById('search-input').value = '';
    loadAnnouncements(); // Reload all announcements
}

