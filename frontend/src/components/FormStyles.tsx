// src/components/FormStyles.tsx
import styled from 'styled-components';

export const FormContainer = styled.div`
  max-width: 400px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

export const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

export const Button = styled.button`
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:disabled {
    background-color: #a0d2ff;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: red;
  background: #ffebeB;
  border: 1px solid red;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
`;