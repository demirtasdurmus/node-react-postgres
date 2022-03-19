import React from 'react';
import { Link } from 'react-router-dom';
import {
  Form,
  Input,
  Checkbox,
  Row,
  Col
} from 'antd';
import styles from './SignIn.module.css';
import useAuth from '../../hooks/useAuth';


export default function SignIn() {
  const { loginUser } = useAuth();

  const onFinish = async (values) => {
    loginUser(values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Row className={styles.loginWrapper}>
      <Col sm={24} md={12} className={styles.loginFormWrapper}>
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
            htmlType="submit"
            className={styles.loginFormButton}>
            SIGN IN
          </button>

        </Form>
        <h2>Don't have an account?</h2>
        <Link to="/sign-up"><span className={styles.link}>Sign Up</span></Link>
      </Col>

      <Col sm={24} md={12} className={styles.illustrationWrapper}>
        <img src="/loginImage.png" alt="Login" />
      </Col>
    </Row>
  );
};
