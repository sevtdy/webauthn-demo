import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import styles from './SignUp.module.css';
import request from '../../utils/request';

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      let creationOptions = await request.post('/challenge', { body: values });
      // console.log(creationOptions);
      let credential = await navigator.credentials.create({ publicKey: creationOptions });
      // console.log(credential);
      let obj = {
        rawId: credential.rawId,
        type: credential.type,
        response: {
          attestationObject: credential.response.attestationObject,
          clientDataJSON: credential.response.clientDataJSON,
        },
      };
      await request.post('/signup', {
        body: {
          ...obj,
          username: values.username,
        },
      });
      notification.success({
        message: 'Success',
        description: 'Thank! your account has been successfully created.',
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Authentication failed, check console for possible error messages.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Form className={styles.form} onFinish={onFinish}>
        <Form.Item name='username' rules={[{ required: true, message: 'Username is required!' }]}>
          <Input placeholder='Username' />
        </Form.Item>
        <Form.Item>
          <div className={styles.submit}>
            <Button type='primary' htmlType='submit' loading={loading}>
              Sign Up
            </Button>
            {loading && <span>Authenticating...</span>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
