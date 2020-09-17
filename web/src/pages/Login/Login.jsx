import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import styles from './Login.module.css';
import request from '../../utils/request';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      let credentialRequestOptions = await request.post('/login/challenge', {
        body: values,
      });
      // console.log(credentialRequestOptions);
      let credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions,
      });
      // console.log(credential);
      await request.post('/login', {
        body: {
          username: values.username,
          rawId: credential.rawId,
          type: credential.type,
          response: {
            clientDataJSON: credential.response.clientDataJSON,
            authenticatorData: credential.response.authenticatorData,
            signature: credential.response.signature,
            userHandle: credential.response.userHandle,
          },
        },
      });
      notification.success({
        message: 'Success',
        description: 'Login Success!',
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
              Sign In
            </Button>
            {loading && <span>Authenticating...</span>}
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}
