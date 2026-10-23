---
id: 1565
type: lab
slug: "vue-todo"
title: "簡単なTODOアプリケーション -『Vue.js』"
date: 2017-09-29T14:30:12+09:00
modified: 2017-09-29T14:30:12+09:00
excerpt: "Vue.jsで作るTODOアプリケーションです。 const app = new Vue({ el: ‘#app’, data: { todoText: ”, todos: [ { text: ‘task A’, do"
primaryTag: "Vue.js"
terms:
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 255, name: "UI", slug: "ui" }
  - { id: 293, name: "Vue.js", slug: "vue-js" }
legacy:
  prev: 無限ループするニュースティッカー-『javascript』
  next: move-an-object-while-drawing-a-circle
---

Vue.jsで作るTODOアプリケーションです。

```

const app = new Vue({
  el: '#app',
  data: {
    todoText: '',
    todos: [
            {
        text: 'task A',
        done: true
      },
      {
        text: 'task B',
        done: false
      },
        ]
  },
  methods: {
        addTodo: function() {
            let newTodo = this.todoText.trim();
      if (!newTodo) {return;}

            this.todos.push(
                {
          text: newTodo,
          done: false
        }
            );
            this.todoText = '';
        }
    },
  computed: {
    // アクティブなtodoを数える
        remaining: function() {
            let count = 0,
            todos = this.todos,
          length = todos.length;

            for (var i = 0; i < length; i++) {
                if (!todos[i].done) {
                    count++;
                }
            }

            return count;
        }
    }
});


```

<p><iframe width="100%" height="300" src="//jsfiddle.net/yutousui/6t7780ua/2/embedded/js,html,result/dark/" allowfullscreen frameborder="0"></iframe></p>
