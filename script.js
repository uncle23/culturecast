let trendingNews = [];
let tutorials = [];

// Load JSON
async function loadPosts(){
  const res = await fetch('trending.json');
  trendingNews = await res.json();
  populateCards('trending-cards', trendingNews);
}

async function loadTutorials(){
  const res = await fetch('tutorials.json');
  tutorials = await res.json();
  populateCards('tutorial-cards', tutorials);
}

loadPosts();
loadTutorials();

// Populate cards with comments
function populateCards(sectionId, items){
  const container = document.getElementById(sectionId);
  container.innerHTML="";
  items.forEach(item=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML=`<img src="${item.img}" alt="${item.title}"><h3>${item.title}</h3><p>${item.summary}</p>`;
    if(item.comments!==undefined){
      const commentDiv=document.createElement('div');
      commentDiv.className='comments';
      commentDiv.innerHTML=`<h4>Comments</h4>
      <div id="comment-list-${item.id}"></div>
      <textarea id="comment-input-${item.id}" placeholder="Add a comment"></textarea>
      <button onclick="addComment(${item.id})">Post Comment</button>`;
      card.appendChild(commentDiv);
      renderComments(item.id);
    }
    container.appendChild(card);
  });
}

// Comments
function addComment(postId){
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if(text!==""){
    const post = trendingNews.find(p=>p.id===postId);
    post.comments.push(text);
    localStorage.setItem('trendingNews', JSON.stringify(trendingNews));
    input.value="";
    renderComments(postId);
  }
}

function renderComments(postId){
  const post = trendingNews.find(p=>p.id===postId);
  const container = document.getElementById(`comment-list-${postId}`);
  container.innerHTML="";
  post.comments.forEach(c=>{
    const div=document.createElement('div');
    div.className='comment';
    div.innerText=c;
    container.appendChild(div);
  });
}

// Chart
const ctx=document.getElementById('dataChart').getContext('2d');
const dataChart=new Chart(ctx,{
  type:'bar',
  data:{labels:['E.coli','S.aureus','P.aeruginosa','B.subtilis'],datasets:[{label:'Lab Experiments This Month',data:[12,19,7,5],backgroundColor:'#00adb5'}]},
  options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
});

// Admin
const adminBtn=document.getElementById('admin-btn');
const modal=document.getElementById('adminModal');
const loginBtn=document.getElementById('loginBtn');
const loginError=document.getElementById('loginError');
const adminPanel=document.getElementById('adminPanel');
const ADMIN_PASSWORD="Culture123";

adminBtn.onclick=()=>{modal.style.display="flex";}
loginBtn.onclick=()=>{
  const pass=document.getElementById('adminPass').value;
  if(pass===ADMIN_PASSWORD){
    loginError.innerText="";
    adminPanel.style.display="block";
    renderAdminPosts();
  }else loginError.innerText="Incorrect password!";
}
window.onclick=(e)=>{if(e.target===modal){modal.style.display="none";}}

// Admin posts editor
function renderAdminPosts(){
  const container=document.getElementById('adminPosts');
  container.innerHTML="";
  trendingNews.forEach(post=>{
    const div=document.createElement('div');
    div.className='admin-post';
    div.innerHTML=`
      <input type="text" value="${post.title}" onchange="editPost(${post.id},'title',this.value)">
      <textarea onchange="editPost(${post.id},'summary',this.value)">${post.summary}</textarea>
      <input type="text" value="${post.img}" placeholder="Image URL" onchange="editPost(${post.id},'img',this.value)">
      <button onclick="deletePost(${post.id})">Delete</button>
    `;
    container.appendChild(div);
  });
}

// Edit/Delete
function editPost(id,key,value){
  const post = trendingNews.find(p=>p.id===id);
  post[key]=value;
  populateCards('trending-cards', trendingNews);
}

function deletePost(id){
  trendingNews = trendingNews.filter(p=>p.id!==id);
  populateCards('trending-cards', trendingNews);
  renderAdminPosts();
}

// Export JSON
document.getElementById('exportJsonBtn').onclick=()=>{
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trendingNews, null,2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "trending.json");
  dlAnchor.click();
};
