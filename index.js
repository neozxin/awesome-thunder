console.log("Hello CodeSandbox");

var xFetchSets = (() => {
  const myAuthUserA = { email: "abc@dd111.eee", password: "222222" };
  const myAuthUserB = { email: "def@dd111.eee", password: "333333" };
  let myAuthToken = null;
  return {
    myAuthUserA,
    myAuthUserB,
    user: {
      async signup(
        signupPayload = {
          name: "dummyName",
          email: `${new Date()
            .toISOString()
            .split(":")
            .slice(0, -1)
            .join("H")
            .split("T")
            .reverse()
            .join("@")}.dummytime`,
          password: "111111",
        },
      ) {
        return fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupPayload),
        });
      },
      async login(loginPayload = myAuthUserA) {
        const request = fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        });
        myAuthToken = (await (await request).json()).token;
        return myAuthToken;
      },
      async getCurrentUser(authToken = myAuthToken) {
        return fetch("/api/auth", {
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
    },
    profile: {
      async updateCurrentUserProfile(
        profilePayload = {
          company: "dummyCompany2",
          status: "dummyStatus2",
          skills: "HTML, CSS, JS, Python",
          facebook: "dummyfacebookurl1",
          youtube: "dummyyoutubeurl1",
        },
        authToken = myAuthToken,
      ) {
        return fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
          body: JSON.stringify(profilePayload),
        });
      },
      async getAllUsersProfiles() {
        return fetch("/api/profile");
      },
      async getAnyUserProfile(userId = "657967cb6554f9a8f6517291") {
        return fetch("/api/profile/user/" + userId);
      },
      async addCurrentUserExperience(
        experiencePayload = {
          title: "dummyTitle2",
          company: "dummyCompany2",
          location: "dummyLocation2",
          from: "2010-01-22",
          current: true,
          description: "dummyDescription1",
        },
        authToken = myAuthToken,
      ) {
        return fetch("/api/profile/experience", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
          body: JSON.stringify(experiencePayload),
        });
      },
      async removeCurrentUserExperience(
        experienceId = "658018408f640c779d188065",
        authToken = myAuthToken,
      ) {
        return fetch("/api/profile/experience/" + experienceId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
        });
      },
      async addCurrentUserEducation(
        educationPayload = {
          school: "dummySchool2",
          degree: "dummyDegree2",
          fieldofstudy: "dummyFieldOfStudy2",
          from: "2010-01-22",
          current: true,
          description: "dummyDescription1",
        },
        authToken = myAuthToken,
      ) {
        return fetch("/api/profile/education", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
          body: JSON.stringify(educationPayload),
        });
      },
      async removeCurrentUserEducation(
        educationId = "658021443aa21eeac8afb95b",
        authToken = myAuthToken,
      ) {
        return fetch("/api/profile/education/" + educationId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
        });
      },
      async getAnyUserGithubInfo(githubUsername = "bradtraversy") {
        return fetch("/api/profile/github/" + githubUsername);
      },
    },
    post: {
      async addPost(text = "abc is like a charm", authToken = myAuthToken) {
        return fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
          body: JSON.stringify({ text }),
        });
      },
      async getCurrentUserPosts(authToken = myAuthToken) {
        return fetch("/api/posts", {
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
      async getAnyPost(
        postId = "6582cd5e3b10305aeb1af8f1",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/" + postId, {
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
      async deletePost(
        postId = "6582cd5e3b10305aeb1af8f1",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/" + postId, {
          method: "DELETE",
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
      async likePost(
        postId = "6582cd2d027d3f8a6eac5b21",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/like/" + postId, {
          method: "PUT",
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
      async unlikePost(
        postId = "6582cd2d027d3f8a6eac5b21",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/unlike/" + postId, {
          method: "PUT",
          headers: {
            "x-auth-token": authToken,
          },
        });
      },
      async addPostComment(
        postId = "6582cd2d027d3f8a6eac5b21",
        text = "abc is like a comment",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/comment/" + postId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
          body: JSON.stringify({ text }),
        });
      },
      async removePostComment(
        postId = "6582cd2d027d3f8a6eac5b21",
        commentId = "658408522b465d312a4adc7b",
        authToken = myAuthToken,
      ) {
        return fetch("/api/posts/comment/" + postId + "/" + commentId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken,
          },
        });
      },
    },
  };
})();
