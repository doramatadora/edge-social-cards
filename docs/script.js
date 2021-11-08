const PREVIEW_URL = "https://thankfully-certain-mallard.edgecompute.app";
const DEMO_URL="https://doramatadora.github.io/edge-social-cards";
const TWEET_URL =
  "https://twitter.com/intent/tweet?text="+encodeURIComponent("Social sharing cards generated on Fastly's Compute@Edge, how neat!") + "&url=";
const preview = document.getElementById("preview");
const formEl = document.getElementById("details");
const title = document.getElementById("title");
const huerot = document.getElementById("huerot");
const tweet = document.getElementById("tweet");
const meta = document.querySelector('meta[property="og:image"]');

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
  const qs = new URLSearchParams(new FormData(formEl)).toString();
  const url = PREVIEW_URL + "/?" + qs;
  preview.src = url;
  meta.setAttribute("content", url);
  tweet.setAttribute("href", TWEET_URL + encodeURIComponent(DEMO_URL + "/?" + qs));
}, 250);

title.addEventListener("keyup", updateSocialCard);
huerot.addEventListener("change", updateSocialCard);

const urlParams = new URLSearchParams(window.location.search);

title.value = urlParams.get("title") || "Edit the social card title";
huerot.value = urlParams.get("huerot") || 0;

updateSocialCard();