import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecommendationPage from './app/recommendation';
import PreferencePage from './app/preference';

const App = () => {
  return (

    <Router>
      <Routes>
        <Route path="/preference" element={<PreferencePage />} />
        <Route path="/recommendation" element={<RecommendationPage />} />
      </Routes>
    </Router>
  );
};

export default App;