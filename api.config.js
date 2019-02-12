// extends 継承
// base どこをルートとするか
module.exports = {
  baseURI: 'https://webmanab-html.com/wp-json',
  api: {
    meta: {
      get: {
        '/': '/'
      }
    },
    post: {
      get: {
        '/posts': 'posts',
        '/posts/:id': 'posts'
      },
      post: {
        '/posts': 'posts'
      },
      put: {
        '/posts/:id': 'posts'
      },
      delete: {
        '/posts/:id': 'posts'
      }
    },
    tip: {
      get: {
        '/tip': 'tip',
        '/tip/:id': 'tip'
      },
      post: {
        '/tip': 'tip'
      },
      put: {
        '/tip/:id': 'tip'
      },
      delete: {
        '/tip/:id': 'tip'
      }
    },
    tips: {
      get: {
        '/tips': 'tips',
        '/tips/:id': 'tips'
      }
    },
    clip: {
      get: {
        '/clip': 'clip',
        '/clip/:id': 'clip'
      },
      post: {
        '/clip': 'clip'
      },
      put: {
        '/clip/:id': 'clip'
      },
      delete: {
        '/clip/:id': 'clip'
      }
    },
    clips: {
      get: {
        '/clips': 'clips',
        '/clips/:id': 'clips'
      }
    },
    category: {
      get: {
        '/categories': 'categories',
        '/categories/:id': 'categories'
      },
      post: {
        '/categories': 'categories'
      },
      put: {
        '/categories/:id': 'categories'
      },
      delete: {
        '/categories/:id': 'categories'
      }
    },
    page: {
      get: {
        '/pages': 'pages',
        '/pages/:id': 'pages'
      },
      post: {
        '/pages': 'pages'
      },
      put: {
        '/pages/:id': 'pages'
      },
      delete: {
        '/pages/:id': 'pages'
      }
    },
    sale: {
      get: {
        '/posts': 'posts',
        '/posts/:id': 'posts'
      },
      post: {
        '/posts': 'posts'
      },
      put: {
        '/posts/:id': 'posts'
      },
      delete: {
        '/posts/:id': 'posts'
      }
    }
  },
  map: {
    post: {
      base: '',
      props: {
        id: 'id',
        title: 'title.rendered',
        content: 'content.rendered',
        type: 'type',
        slug: 'slug',
        date: 'date',
        next: 'next',
        prev: 'prev',
        images: {
          extends: 'image',
          base: '_embedded.wp:featuredmedia',
          props: {}
        },
        terms: 'terms',
        fields: 'acf'
      }
    },
    page: {
      extends: 'post'
    },
    tip: {
      extends: 'post'
    },
    clip: {
      extends: 'post'
    },
    category: {
      extends: 'term'
    },
    term: {
      id: 'id',
      count: 'count',
      description: 'description',
      link: 'link',
      name: 'name',
      slug: 'slug',
      parent: 'parent'
    },
    image: {
      id: 'id',
      title: 'title.rendered',
      caption: 'caption.rendered',
      alt: 'alt_text',
      url: 'source_url',
      sizes: 'media_details.sizes'
    },
    author: {
      id: 'id',
      name: 'name',
      url: 'url',
      description: 'description',
      link: 'link'
    }
  }
}
