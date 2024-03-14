importScripts("./js/sw-cache.js");

const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  prefetch: "prefetch-cache-v" + CACHE_VERSION,
};

self.addEventListener("install", (event) => {
  const now = Date.now();

  const urlsToPrefetch = [
    "https://jsonplaceholder.typicode.com/todos",
    "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png",
  ];

  console.log("Handling install event. Resources to prefetch:", urlsToPrefetch);

  event.waitUntil(
    caches
      .open(CURRENT_CACHES.prefetch)
      .then(function (cache) {
        const cachePromises = urlsToPrefetch.map(function (urlToPrefetch) {
          const url = new URL(urlToPrefetch);
          url.search += (url.search ? "&" : "?") + "cache-bust=" + now;

          const request = new Request(url, { mode: "no-cors" });
          return fetch(request)
            .then(function (response) {
              if (response.status >= 400) {
                throw new Error(
                  "request for " +
                    urlToPrefetch +
                    " failed with status " +
                    response.statusText
                );
              }

              return cache.put(urlToPrefetch, response);
            })
            .catch(function (error) {
              console.error(
                "Not caching " + urlToPrefetch + " due to " + error
              );
            });
        });

        return Promise.all(cachePromises).then(function () {
          console.log("Pre-fetching complete.");
        });
      })
      .catch(function (error) {
        console.error("Pre-fetching failed:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("WORKER: activate event in progress.");
  event.waitUntil(self.clients.claim());

  const expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            console.log("Deleting out of date cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log("Handling fetch event for", event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("Found response in cache:", response);

        return response;
      }

      console.log("No response found in cache. About to fetch from network...");

      return fetch(event.request)
        .then(function (response) {
          console.log("Response from network is:", response);

          return response;
        })
        .catch(function (error) {
          console.error("Fetching failed:", error);
          throw error;
        });
    })
  );
});
