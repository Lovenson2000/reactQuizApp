import { useEffect, useReducer } from "react";
import Header from "./Header";
import Loader from "./Loader";
import Error from "./Error";
import Main from "./Main";
import { StartScreen } from "./StartScreen";
import { Question } from "./Question";
import { NextButton } from "./NextButton";
import { Progress } from "./Progress";
import { FinishedScreen } from "./FinishedScreen";

const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };

    case 'dataFailed':
      return {
        ...state,
        status: "error",
      };

    case "start":
      return {
        ...state,
        status: "active",
      }

    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ?
          state.points + question.points :
          state.points,
      }

    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      }
    case "finish" :
      return{
        ...state,
        status : "finished",
        highscore: state.points > state.highscore ? state.points :
        state.highscore,
      }
      case "restart":
        return{
          ...state,
          points: 0,
          highscore: 0,
          index: 0,
          answer: null,
          status: "ready",
        }

    default:
      throw new Error("Action unknown");
  }
}

export default function App() {

  const [{ questions, status, index, answer, points, highscore }, dispatch] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPoints = questions.reduce((prev, cur) => prev + cur.points, 0)

  useEffect(() => {

    fetch("http://localhost:9000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({
        type: 'dataReceived',
        payload: data
      }))
      .catch((error) => dispatch({ type: 'dataFailed' }))

  }, []);
  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && <StartScreen
          numQuestions={numQuestions} dispatch={dispatch} />}

        {status === "active" &&
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPoints={maxPoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <NextButton
              dispatch={dispatch}
              answer={answer}
              index={index}
              numQuestions={numQuestions}
            />
          </>
        }
        {status === "finished" &&
          <FinishedScreen
            points={points}
            maxPoints={maxPoints}
            numQuestions={numQuestions}
            highscore={highscore}
            dispatch={dispatch}
            />}
      </Main>

    </div>
  );
}