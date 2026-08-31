import apiClient from "../../../api/apiClient";

export async function fetchCommunityPosts(courseId) {
  return apiClient(`/api/courses/${courseId}/community/questions`);
}

export async function createCommunityPost(courseId, content) {
  return apiClient(`/api/courses/${courseId}/community/questions`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function updateCommunityPost(courseId, postId, content) {
  return apiClient(`/api/courses/${courseId}/community/questions/${postId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deleteCommunityPost(courseId, postId) {
  await apiClient(`/api/courses/${courseId}/community/questions/${postId}`, {
    method: "DELETE",
  });
  return true;
}

export async function addComment(courseId, postId, content) {
  return apiClient(`/api/courses/${courseId}/community/questions/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(courseId, postId, commentId) {
  await apiClient(`/api/courses/${courseId}/community/questions/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
  return true;
}

export async function toggleUpvote(courseId, postId) {
  return apiClient(`/api/courses/${courseId}/community/questions/${postId}/upvote`, {
    method: "POST",
  });
}

export async function routeQuestion(courseId, postId, topN = 3) {
  return apiClient(`/api/courses/${courseId}/community/route`, {
    method: "POST",
    body: JSON.stringify({ postId, topN }),
  });
}

export async function fetchSinglePost(courseId, postId) {
  return apiClient(`/api/courses/${courseId}/community/questions/${postId}`);
}

export async function exportGraph(courseId, graphType = "interaction") {
  return apiClient(`/api/courses/${courseId}/community/graph?graphType=${graphType}`);
}
