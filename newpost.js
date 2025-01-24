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

// Initialize filters-content container references
const indexFiltersContent = document.querySelector('.filters-content .row.portfolio-grid');
const adminFiltersContent = document.querySelector('.filters-content .row.portfolio-grid');

// Function to render Instagram post blocks
function renderInstagramPost(doc) {
    const postData = doc.data();
    const html = `
        <div class="col-lg-4 col-md-6 all ${postData.category}">
            <div class="portfolio_box">
                <div class="single_portfolio">
                    <blockquote class="instagram-media" 
                        data-instgrm-permalink="${postData.instagramUrl}"
                        data-instgrm-version="14"
                        style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                        ${postData.embedCode}
                    </blockquote>
                    <script async src="//www.instagram.com/embed.js"></script>
                </div>
            </div>
        </div>
    `;

    // Add to appropriate container based on which page we're on
    const container = window.location.pathname.includes('admin.html') ?
        adminFiltersContent : indexFiltersContent;

    if (container) {
        container.insertAdjacentHTML('beforeend', html);
    }
}

// Real-time listener for posts collection
db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    // Clear existing content
    if (indexFiltersContent) indexFiltersContent.innerHTML = '';
    if (adminFiltersContent) adminFiltersContent.innerHTML = '';

    snapshot.forEach(doc => {
        renderInstagramPost(doc);
    });
});

// Only add form submission handling if we're on admin.html
if (window.location.pathname.includes('admin.html')) {
    const form = document.querySelector('#add-post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const instagramUrl = form.instagramUrl.value;
            const embedCode = form.embedCode.value;
            const category = form.category.value;

            await db.collection('posts').add({
                instagramUrl,
                embedCode,
                category,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            form.reset();
        });
    }
}
