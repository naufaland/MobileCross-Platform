import axios from "axios";

const ENV = process.env.EXPO_PUBLIC_API_URL;

const localPostsCache = new Map();

const api = axios.create({
  baseURL: ENV,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export const getUsers = () => {
  return api.get("/users");
};

export const getPosts = () => {
  return api.get("/posts").then((response) => {
    const posts = response.data.map((post) => {
      if (localPostsCache.has(post.id)) {
        console.log(`Using cached version of post ${post.id}`);
        return localPostsCache.get(post.id);
      }
      return post;
    });

    return {
      ...response,
      data: posts,
    };
  });
};

export const getPostById = (id) => {
  if (localPostsCache.has(id)) {
    console.log(`Returning cached post ${id}`);
    return Promise.resolve({
      data: localPostsCache.get(id),
      status: 200,
    });
  }
  return api.get(`/posts/${id}`);
};

export const updatePost = (id, data) => {
  return api.put(`/posts/${id}`, data).then((response) => {
    console.log(`Caching updated post ${id}:`, data);
    localPostsCache.set(id, data);
    return response;
  });
};

export const postData = (data) => {
  return api.post("/posts", data);
};

export const clearCache = () => {
  localPostsCache.clear();
  console.log("Local posts cache cleared");
};
