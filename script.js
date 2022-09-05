const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 16
const users = [];
let filteredUsers = []
const followList = JSON.parse(localStorage.getItem('follows')) || []
const dataPanel = document.querySelector("#data-panel");
const genderContainer = document.querySelector("#gender-container")
const ageContainer = document.querySelector("#age-container")
const age = document.querySelector("#age")
const btnFilterSubmit = document.querySelector("#btn-filter-submit")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

let filterGender = 'all'
let filterMinAge = 0
let filterMaxAge = 100

// 函式
// 渲染filter的age範圍函式
function renderAge(startPoint, range) {
  let minAge = Number(startPoint) - Number(range)
  let maxAge = Number(startPoint) + Number(range)
  if (minAge < 0) {
    minAge = 0
    age.textContent = `between 0 and ${maxAge}`
  } else {
    age.textContent = `between ${minAge} and ${maxAge}`
  }
  filterMinAge = minAge
  filterMaxAge = maxAge
}
// 渲染主畫面user list函式
function renderUserList(usersData) {
  let HTMLContent = "";
  usersData.forEach((userData) => {
    if (followList.some(user => user.id === userData.id)) {
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
    } else {
      HTMLContent += `
      <div class="card user m-3">
        <img src="${userData.avatar}"class="card-img-top" alt="user image" data-id="${userData.id}">
        <div class="card-body d-flex align-items-center" data-id="${userData.id}">
          <h5 class="card-text" data-id="${userData.id}">${userData.name} ${userData.surname}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${userData.id}">More</button>
          <button class="btn btn-danger btn-follow" data-id="${userData.id}">Follow</button>
        </div>
      </div>
  `;
    }
  });
  dataPanel.innerHTML = HTMLContent;
}
// 渲染modal內容函式
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
// follow user函式
function follow(id) {
  const followed = users.find(user => user.id === id)
  followList.push(followed)
  localStorage.setItem('follows', JSON.stringify(followList))
}
// unfollow user函式
function unfollow(id) {
  const followedIndex = followList.findIndex(user => user.id === id)
  if (followedIndex < 0) return
  followList.splice(followedIndex, 1)
  localStorage.setItem('follows', JSON.stringify(followList))
}
// 切換unfollow樣式函式
function styleUnfollow(node) {
  node.classList.remove('btn-follow', 'btn-danger')
  node.classList.add('btn-unfollow', 'btn-dark')
  node.innerText = 'Unfollow'
}
// 切換follow樣式函式
function styleFollow(node) {
  node.classList.remove('btn-unfollow', 'btn-dark')
  node.classList.add('btn-follow', 'btn-danger')
  node.innerText = 'Follow'
}
// 分頁函式
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}
// 渲染分頁函式
function renderPaginator(usersAmount) {
  const numberOfPages = Math.ceil(usersAmount / USERS_PER_PAGE)
  let HTMLContent = ''
  for (let page = 1; page <= numberOfPages; page++) {
    HTMLContent += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = HTMLContent
}

// 取出所有使用者資料放到users陣列裡並渲染畫面
axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  renderUserList(getUsersByPage(1))
  renderPaginator(users.length)
});
// 渲染分頁
// show more與follow/ unfollow按鈕
dataPanel.addEventListener("click", (event) => {
  if (event.target.matches('.btn-show-info')) {
    showMore(Number(event.target.dataset.id));
  } else if (event.target.matches('.btn-follow')) {
    follow(Number(event.target.dataset.id))
    styleUnfollow(event.target)
  } else if (event.target.matches('.btn-unfollow')) {
    unfollow(Number(event.target.dataset.id))
    styleFollow(event.target)
  }
});
// filter內選擇性別
genderContainer.addEventListener("input", (event) => {
  filterGender = event.target.value
})
// filter內選擇年齡
ageContainer.addEventListener("input", () => {
  const ageStartPoint = document.querySelector("#age-start-point")
  const ageRange = document.querySelector("#age-range")
  renderAge(ageStartPoint.value, ageRange.value)
})
// filter內的submit按鈕
btnFilterSubmit.addEventListener("click", () => {
  if (filterGender !== 'male' && filterGender !== 'female') {
    filteredUsers = users.filter(user =>
      user.age >= filterMinAge && user.age <= filterMaxAge
    )
  } else {
    filteredUsers = users.filter(user =>
      user.gender === filterGender && user.age >= filterMinAge && user.age <= filterMaxAge
    )
  }
  if (filteredUsers.length === 0) {
    return alert('找不到符合結果的使用者')
  }
  renderUserList(getUsersByPage(1))
  searchInput.value = ''
  renderPaginator(filteredUsers.length)
})
// search bar搜尋，需同時符合filter內的gender與age條件
searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (filterGender !== 'male' && filterGender !== 'female') {
    filteredUsers = users.filter(user =>
      user.age >= filterMinAge && user.age <= filterMaxAge &&
      (user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
    )
  } else {
    filteredUsers = users.filter(user =>
      user.gender === filterGender && user.age >= filterMinAge && user.age <= filterMaxAge &&
      (user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
    )
  }
  if (filteredUsers.length === 0) {
    return alert('找不到符合結果的使用者')
  }
  renderUserList(getUsersByPage(1))
  // searchInput.value = ''
  renderPaginator(filteredUsers.length)
})

// 切換分頁
paginator.addEventListener('click', (event) => {
  if (event.target.tagName !== 'A') return
  const page = (event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})