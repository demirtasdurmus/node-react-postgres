import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Checkbox,
  Row,
  Col
} from 'antd';
import styles from './SignIn.module.css';
import useAuth from '../../hooks/useAuth';


export default function SignIn(props) {
  const { loginUser } = useAuth();
  let location = useLocation();
  let redirectPage = location.state && location.state.from.pathname
  console.log("sign in props", redirectPage)

  const onFinish = async (values) => {
    loginUser(values, redirectPage);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Row className={styles.loginWrapper}>
      <Col span={24} className={styles.loginFormWrapper}>
        <Form
          className={styles.loginForm}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <p className={styles.formTitle}>Sign In</p>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              placeholder="email"
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Password"
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <button
            type="primary"
            className={styles.loginFormButton}>
            SIGN IN
          </button>

        </Form>
        <h2>Don't have an account?</h2>
        <Link to="/sign-up"><span className={styles.link}>Sign Up</span></Link>
      </Col>
    </Row>
  );
};
