const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const users = JSON.parse(localStorage.getItem('follows'))
const dataPanel = document.querySelector("#data-panel");

// 函式
// 渲染主畫面user list
function renderUserList(usersData) {
  let HTMLContent = "";
  usersData.forEach((userData) => {
    HTMLContent += `
      <div class="card user m-3">
        <img src="${userData.avatar}"class="card-img-top" alt="user image" data-id="${userData.id}">
        <div class="card-body d-flex align-items-center" data-id="${userData.id}">
          <h5 class="card-text" data-id="${userData.id}">${userData.name} ${userData.surname}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${userData.id}">More</button>
          <button class="btn btn-dark btn-unfollow" data-id="${userData.id}">Unfollow</button>
        </div>
      </div>
  `;
  });
  dataPanel.innerHTML = HTMLContent;
}
// 渲染modal內容
function showMore(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalImage = document.querySelector(".modal-image");
  const modalDescription = document.querySelector(".modal-description");
  const loadingContainer = document.querySelector('#loading-container')
  // img畫面監聽器控制loading畫面顯示
  loadingContainer.style.visibility = 'visible'
  modalImage.addEventListener('load', () => {
    loadingContainer.style.visibility = 'hidden'
  })

  axios.get(INDEX_URL + id).then((response) => {
    const dataResults = response.data;

    modalTitle.innerText = `${dataResults.name} ${dataResults.surname}`;
    modalImage.src = dataResults.avatar;
    modalDescription.innerHTML = `
    <p>email: ${dataResults.email}</p>
    <p>gender: ${dataResults.gender}</p>
    <p>age: ${dataResults.age}</p>
    <p>region: ${dataResults.region}</p>
    <p>birthday: ${dataResults.birthday}</p>
    `
  });
}
// unfollow user
function unfollow(id) {
  if (!users || !users.length) return
  const followedIndex = users.findIndex(user => user.id === id)
  if (followedIndex < 0) return
  users.splice(followedIndex, 1)
  localStorage.setItem('follows', JSON.stringify(users))
  renderUserList(users)
}

// show more與follow
dataPanel.addEventListener("click", (event) => {
  if (event.target.matches('.btn-show-info')) {
    showMore(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-unfollow')) {
    unfollow(Number(event.target.dataset.id))
  }
});

renderUserList(users)