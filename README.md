# Exam Practice App

This is a lightweight quiz application to help you prepare for Certification exams (e.g., MS-900).

## Features

- Load 50 random questions from a text file (`questions.txt`)
- Multiple-choice with support for multiple correct answers
- Check answers with color-coded feedback
- Track number of correct answers and total time taken

## How to Use

1. Clone this repo or download as ZIP
2. Open `index.html` in a browser (or host via GitHub Pages)
3. Edit `questions.txt` to add your own questions

## Question Format

```
#QUESTION
Your question text here?
- Incorrect Answer
* Correct Answer
* Another Correct Answer
- Another Incorrect Answer
```

## Hosting on GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings** > **Pages**
3. Set source to `main` branch and `/ (root)` folder
4. Access your quiz at `https://yourusername.github.io/reponame/`
