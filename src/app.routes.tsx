import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SignIn } from "./pages/signIn";
import { RequireAuth } from "./components/RequireAuth";
import { Planning } from "./pages/production/planning";
import { RegisterTag } from "./pages/production/registerTag";
import { TagGenerator } from "./pages/production/tagGenerator";
import { Layout } from "./components/Layout";

export function AppRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={Layout}>

          <Route path="sginIn" Component={SignIn} />

          <Route element={<RequireAuth />}>
            <Route path='/' Component={TagGenerator} />
            <Route path='registerTag' Component={RegisterTag} />
            <Route path='planning' Component={Planning} />
          </Route>

          <Route path='*' element={<h1>Not Found (404)!</h1>} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}