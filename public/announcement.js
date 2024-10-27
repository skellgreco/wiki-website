document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const category = urlParams.get('category');

    if (id && category) {
        fetch('/announcements.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Log the data for debugging
                console.log("Fetched data:", data);

                // Find the announcement by id within the specified category
                const announcement = data[category].find(item => item.id === id);

                // Log the found announcement for debugging
                console.log("Found announcement:", announcement);

                if (announcement) {
                    document.getElementById('announcement-title').textContent = announcement.title;
                    document.getElementById('announcement-title-text').textContent = announcement.title;
                    document.getElementById('announcement-content').innerHTML = formatContent(announcement.content);
                    document.getElementById('announcement-date').textContent = `Date: ${formatDate(announcement.date)}`;
                } else {
                    document.getElementById('announcement-title').textContent = "Announcement not found";
                    document.getElementById('announcement-content').textContent = "";
                    document.getElementById('announcement-date').textContent = "";
                }
            })
            .catch(error => {
                console.error('Error loading announcement:', error);
                document.getElementById('announcement-title').textContent = "Error loading announcement";
            });
    } else {
        document.getElementById('announcement-title').textContent = "Invalid announcement URL";
    }
});

function formatContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^- (.*$)/gim, '     • $1')
        .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+(?:\?[^\s)]+)?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')
        .replace(/(https?:\/\/[^\s]+(?:\?[^\s]*)?\.(?:png|jpg|jpeg|gif|webp))/g, '<center><img src="$1" style="max-width: 100%; height: auto;"></center>')
        .replace(/\n/g, '<br>');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
