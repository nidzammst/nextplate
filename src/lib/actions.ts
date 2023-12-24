"use server";

export const getArticlesFromApi = async (
  page: number | string = 1,
  limit: number | string = 6,
) => {
  const url = `https://api.slingacademy.com/v1/sample-data/blog-posts?offset=${Number(
    (page - 1) * limit /* for skipping the posts */,
  )}&limit=${Number(limit)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.blogs;
};

export const getAuthorById = async (user_id: number | string) => {
  const url = `https://api.slingacademy.com/v1/sample-data/users/${Number(
    user_id,
  )}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.user;
};

export const getSinglePost = async (post_id: number | string) => {
  const url = `https://api.slingacademy.com/v1/sample-data/blog-posts/${post_id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.blog;
};
