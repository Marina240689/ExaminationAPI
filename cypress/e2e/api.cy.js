import users from '../fixtures/user.json'
import post from '../fixtures/posts.json'
import { faker, ur } from '@faker-js/faker'


users.email = faker.internet.email();
users.password = faker.internet.password({ length: 11 });
post.title = faker.lorem.sentence();
post.body = faker.lorem.paragraph();



describe('API', () => {


  it(' Get all posts. Verify HTTP response status code and content type.', () => {
    cy.request({
      method: 'GET',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.eq('application/json; charset=utf-8');
      console.log("response.status: " + JSON.stringify(response.headers));
    })
  });


  it('Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned. ', () => {
    cy.request({
      method: 'GET',
      url: '/posts?_page=1&_limit=10',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.lengthOf(10);
      console.log(response.body);
    })

  });

  it('Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {

    const postID = [55, 60];
    postID.forEach(postID => {
      cy.request({
        method: 'GET',
        url: `/posts/${postID}`,

      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(postID)
        console.log(JSON.stringify(response.body.id));
      })

    })

  });

  it('Create a post. Verify HTTP response status code.', () => {

    cy.request({
      method: 'POST',
      url: '/664/posts',
      failOnStatusCode: false,
      headers: {
        'Content-Type': 'application/json'
      },
      body: post,
    }).then(response => {
      expect(response.status).to.eq(401);
    })
  })

  it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created', () => {

    let token;
    let postId;

    cy.request({
      method: "POST",
      url: "/register",
      body: users,

    }).then(response => {
      expect(response.status).to.eq(201);
      token = response.body.accessToken;
      console.log(token)

    }).then(() => {

      cy.request({
        method: 'POST',
        url: '/664/posts',
        body: users,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(response => {
        expect(response.status).to.eq(201);
        postId = response.body.id;

        cy.request({
          method: 'GET',
          url: `/664/posts/${postId}`
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.id).to.eq(postId);
          expect(response.body.email).to.eq(users.email);

        })
      })
    })
  })


  it('Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {

    cy.request({
      method: 'POST',
      url: '/posts',
      body: JSON.stringify(post),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).contain(post);
    })
  })


  it('Update non-existing entity. Verify HTTP response status code.', () => {

    cy.request({
      method: 'PUT',
      url: '/posts',
      failOnStatusCode: false,
      body: post,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(404);
    })
  })


  it('Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {

    let postId;
    let newPostBody;
    let updatedBody;

    cy.request({
      method: 'POST',
      url: '/posts',
      body: post,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.title).to.eq(post.title)
      expect(response.body.body).to.eq(post.body)
      postId = response.body.id;
      newPostBody = response.body.body;
    }).then(() => {
      post.body = faker.lorem.paragraph();

      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        body: post,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.body).to.eq(post.body)
        console.log(response.body)

        updatedBody = response.body.body;

        expect(updatedBody).to.not.eq(newPostBody)

      })
    })
  })

  it('Delete non-existing post entity. Verify HTTP response status code.', () => {

    cy.request({
      method: 'DELETE',
      url: '/posts',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    })
  })

  it('Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {

    let postId;
    let newPostBody;
    let updatedBody;

    cy.request({
      method: 'POST',
      url: '/posts',
      body: post,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.title).to.eq(post.title)
      expect(response.body.body).to.eq(post.body)
      postId = response.body.id;
    }).then(() => {
      post.body = faker.lorem.paragraph();

      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        body: post,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.body).to.eq(post.body)

        updatedBody = response.body.body;

        expect(updatedBody).to.not.eq(newPostBody)

      }).then(() => {

        cy.request({
          method: 'DELETE',
          url: `/posts/${postId}`,

        }).then((response) => {
          expect(response.status).to.eq(200);
        }).then(() => {

          cy.request({
            method: 'GET',
            url: `/posts/${postId}`,
            failOnStatusCode: false,
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }).then((response) => {
            expect(response.status).to.eq(404);

          })

        })
      })

    })

  })


})












