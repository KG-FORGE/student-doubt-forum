const answers = [
  {
    id: 1,
    questionId: 1,
    content:
      "The mid value represents the middle index of the current search range. We compare the target with the middle element and remove half of the search space. ",
    author: "Gifty",
    votes: 8,
  },
  {
    id: 2,
    questionId: 1,
    content:
      "Use mid = left + (right - left) / 2. This avoids potential integer overflow compared to (lleft + right) / 2. ",
    author: "Rahul",
    votes: 5,
  },
  {
    id: 3,
    questionId: 2,
    content:
      "useState is a React Hook used to store and update data inside a functional component. ",
    author: "Kartik",
    votes: 10,
  },
  {
    id: 4,
    questionId: 2,
    content:
      "When state changes using the setter function, React re-renders the component with the updated value.",
    author: "Priya",
    votes: 6,
  },
];

export default answers;
