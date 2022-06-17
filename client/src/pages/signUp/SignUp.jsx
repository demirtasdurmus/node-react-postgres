import React from 'react';
import { Link } from 'react-router-dom';
import {
  Form,
  Input,
  Row,
  Col
} from 'antd';
import styles from './SignUp.module.css';
import useAuth from '../../hooks/useAuth';


export default function SignIn() {
  const { registerUser } = useAuth();

  const onFinish = async (values) => {
    registerUser(values);
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
          <p className={styles.formTitle}>Sign Up</p>
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input
              placeholder="First Name"
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input
              placeholder="lastName"
              className={styles.formInput}
            />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 5, message: 'Password must be minimum 5 characters!' }
            ]}
          >
            <Input.Password
              placeholder="Password"
              className={styles.formInput}
            />
          </Form.Item>

          <Form.Item
            name="passwordConfirm"
            rules={[{ required: true, message: 'Please input your password again!' },
            { min: 5, message: 'Password must be minimum 5 characters!' }
            ]}
          >
            <Input.Password
              placeholder="Password Again"
              className={styles.formInput}
            />
          </Form.Item>

          <button
            type="primary"
            className={styles.loginFormButton}>
            SIGN UP
          </button>

        </Form>
        <h2>Already have an account?</h2>
        <Link to="/sign-in"><span className={styles.link}>Sign In</span></Link>
      </Col>
    </Row>
  );
};
