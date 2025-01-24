// Show admin panel after login
function checkPasscode() {
    const passcode = document.getElementById('passcode').value;
    if (passcode === 'embraceangelyogis') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadExistingPosts();
    } else {
        alert('密碼錯誤');
    }
}

// Load existing posts
function loadExistingPosts() {
    const postsDiv = document.getElementById('existingPosts');
    postsDiv.innerHTML = '';

    db.collection('instagram_posts').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.className = 'mb-3 p-3 border';
            postElement.innerHTML = `
                    <div class="mb-2">
                        <strong>類別:</strong> ${post.type}
                    </div>
                    <div class="mb-2">
                        <strong>嵌入碼:</strong>
                        <pre class="border p-2">${post.iframe}</pre>
                    </div>
                    <button class="btn btn-danger" onclick="deletePost('${doc.id}')">刪除</button>
                `;
            postsDiv.appendChild(postElement);
        });
    });
}

// Add new post
function addNewPost() {
    const iframe = document.getElementById('newIframeCode').value;
    const typeSelect = document.getElementById('newPostType');

    // Get all selected options and join their values with spaces
    const selectedTypes = Array.from(typeSelect.selectedOptions)
        .map(option => option.value)
        .join(' ');

    if (!iframe || !selectedTypes) {
        alert('請填寫所有欄位');
        return;
    }

    db.collection('instagram_posts').add({
        iframe: iframe,
        type: selectedTypes,  // This will now be a space-separated string of types
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('newIframeCode').value = '';
        typeSelect.value = '';  // Clear selection
        loadExistingPosts();
        alert('貼文已新增');
    }).catch((error) => {
        console.error('Error adding post: ', error);
        alert('新增貼文時發生錯誤');
    });
    loadPortfolioPosts();
}

// Delete post
function deletePost(docId) {
    if (confirm('確定要刪除這個貼文嗎？')) {
        db.collection('instagram_posts').doc(docId).delete().then(() => {
            alert('貼文已刪除');
            loadExistingPosts();
        }).catch((error) => {
            alert('錯誤: ' + error);
        });
    }
}

// Load posts on page load
function loadPortfolioPosts() {
    const portfolioGrid = document.querySelector('.portfolio-grid');

    db.collection('instagram_posts').orderBy('timestamp', 'desc').get().then((snapshot) => {
        portfolioGrid.innerHTML = ''; // Clear existing posts

        snapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.className = `col-lg-4 col-md-6 all ${post.type}`;
            postElement.innerHTML = `
                    <div class="portfolio_box">
                        <div class="single_portfolio">
                            ${post.iframe}
                        </div>
                    </div>
                `;
            portfolioGrid.appendChild(postElement);
        });

        // Reinitialize Instagram embeds
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        }
    });
}

// Load posts when document is ready
document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadExistingPosts();
    }
    loadPortfolioPosts();
});
