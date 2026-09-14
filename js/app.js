// Define current year in footer
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    const postList = document.getElementById('post-list');
    const postContent = document.getElementById('post-content');

    if (postList) {
        loadPostList();
    } else if (postContent) {
        loadSinglePost();
    }
});

// Format date nicely
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Load the list of posts on index.html
async function loadPostList() {
    const postList = document.getElementById('post-list');
    try {
        const response = await fetch('posts.json');
        if (!response.ok) throw new Error('Não foi possível carregar o índice de postagens.');
        
        const posts = await response.json();
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        postList.innerHTML = '';
        
        posts.forEach((post, index) => {
            const card = document.createElement('a');
            card.href = `post.html?id=${post.id}`;
            card.className = 'post-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <h3>${post.title}</h3>
                <span class="date">${formatDate(post.date)}</span>
                <p>${post.summary}</p>
            `;
            postList.appendChild(card);
        });
    } catch (error) {
        postList.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
}

// Load a single post on post.html
async function loadSinglePost() {
    const postContent = document.getElementById('post-content');
    
    // Get the post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        postContent.innerHTML = '<h1>Post não encontrado.</h1>';
        return;
    }

    try {
        // Fetch posts.json to get metadata
        const metadataResponse = await fetch('posts.json');
        const posts = await metadataResponse.json();
        const postMeta = posts.find(p => p.id === postId);
        
        // Fetch the markdown content
        const mdResponse = await fetch(`posts/${postId}.md`);
        if (!mdResponse.ok) throw new Error('Conteúdo não encontrado.');
        
        const markdown = await mdResponse.text();
        
        // Parse markdown and sanitize
        const rawHtml = marked.parse(markdown);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        
        // Inject header and content
        let html = '';
        if (postMeta) {
            document.title = `${postMeta.title} - Minhas Pesquisas`;
            html += `<h1>${postMeta.title}</h1>`;
            html += `<span class="meta-date">${formatDate(postMeta.date)}</span>`;
        }
        
        html += cleanHtml;
        postContent.innerHTML = html;
        
        if (window.hljs) {
            postContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
        
    } catch (error) {
        postContent.innerHTML = `<h1>Erro ao carregar</h1><p>${error.message}</p>`;
    }
}
