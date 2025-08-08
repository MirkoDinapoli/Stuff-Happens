import { useActionState, useEffect } from "react";
import { Alert, Form, FloatingLabel, Button, Col, Row, Container } from "react-bootstrap";
import { useNavigate } from "react-router";

export default function LoginPage({enterLogIn, exitLogIn, handleLogin}){
    const [state, formAction, isPending] = useActionState(loginFun, {username:"", password:""});
    const navigate = useNavigate();

    useEffect(() => enterLogIn(), []);

    async function loginFun(prevState, formData){
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password'),
        }; 

        try{
            await handleLogin(credentials);
            return {success: true};
        }catch(error){
            return {error: 'Login failed. Check you email and/or password.'};        
        }
    }

    return(
        <Container style={{ minHeight: "80vh" }} className="centered_content_flex">
        
                { isPending && <Alert variant="info">The server needs its time, wait...</Alert> }

                <Form action={formAction}>
                    <FloatingLabel className='mb-3' controlId="username" label='username'>
                        <Form.Control name='username' type='email' placeholder='username' required={true}></Form.Control>
                    </FloatingLabel>
                    <FloatingLabel className='mb-3' controlId='password' label='password'>
                        <Form.Control name='password' type='password' placeholder='password' required={true} minLength={1}></Form.Control>
                    </FloatingLabel>

                    {state.error && <p className="text-danger">{state.error}</p>}

                    <div className="centered_content">
                        <Button variant='success' type='submit'>Login</Button>
                        <Button variant='danger' onClick={()=>{exitLogIn(); navigate("/");}}>Cancel</Button>
                    </div>
                </Form>
        </Container>
    );
}