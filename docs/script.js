const DEMO_URL="https://social-cards-demo.edgecompute.app";
const TWEET_URL =
  "https://twitter.com/intent/tweet?text="+encodeURIComponent("Social sharing cards generated on Fastly's Compute@Edge, how neat!") + "&url=";
const preview = document.getElementById("preview");
const formEl = document.getElementById("details");
const title = document.getElementById("title");
const huerot = document.getElementById("huerot");
const tweet = document.getElementById("tweet");
const meta = document.querySelector('meta[property="og:image"]');
const twimg = document.querySelector('meta[property="twitter:image"]');

// By Trey Huffine (https://gist.github.com/treyhuffine/2ced8b8c503e5246e2fd258ddbd21b8c#file-debounce-js)
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const updateSocialCard = debounce(function () {
  const qs = "title=" + encodeURIComponent(title.value) + "&huerot=" + huerot.value;
  const url = DEMO_URL + "/card/?" + qs;
  preview.src = url;
  meta.setAttribute("content", url);
  twimg.setAttribute("content", url);
  tweet.setAttribute("href", TWEET_URL + DEMO_URL + "/?" + qs);
}, 250);

title.addEventListener("keyup", updateSocialCard);
huerot.addEventListener("change", updateSocialCard);

const urlParams = new URLSearchParams(window.location.search);

title.value = decodeURIComponent(urlParams.get("title") || "Edit the social card title");
huerot.value = urlParams.get("huerot") || 0;

updateSocialCard();