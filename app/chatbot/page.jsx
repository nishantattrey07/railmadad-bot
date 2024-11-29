'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Upload, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  multiLang,
  availableDepartments,
  imageUploadQuestion
} from '../../lib/constants';
import { motion } from 'framer-motion';
import { NewComplaint } from 'app/actions/newComplaint';

// Ensure this is set in your environment variables
const API_KEY = process.env.NEXT_PUBLIC_APIKEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

const TypingAnimation = ({ content }) => {
  if (typeof content !== 'string' || content.trim() === '') {
    return null;
  }

  const words = content.split(' ');

  return (
    <div className="typing-animation">
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            delay: index * 0.1
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </div>
  );
};

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState(null);
  const [pnrVerified, setPnrVerified] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [language, setLanguage] = useState(null);
  const [showLanguageOptions, setShowLanguageOptions] = useState(true);
  const [pnr, setPnr] = useState('');
  const [jsonSent, setJsonSent] = useState(false);
  const [jsonGenerated, setJsonGenerated] = useState(false);
  const [UUID, setUUID] = useState('');
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const inputIsNotEmpty = input.trim().length > 0;
    setIsTyping(inputIsNotEmpty);

    // Set pnrVerified to true if input is not empty and language is selected
    if (inputIsNotEmpty && language && pnrVerified) {
      setPnrVerified(true);
    }
  }, [input, language, pnrVerified]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const handleImageUpload = useCallback(
    (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setImage(file);

        // Convert image to base64 and create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          const base64String = reader.result.split(',')[1];
          setImageBase64(base64String);
        };
        reader.readAsDataURL(file);

        addModelResponse(multiLang[language].imageUploaded);
        setGeminiEnabled(true);
      }
    },
    [language]
  );

  const removeImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setImageBase64(null);
  }, []);

  const handleSubmit = async () => {
    if (input.trim() === '' && !image) return;
    const newUserMessage = {
      role: 'user',
      content: input,
      image: imagePreview
    };
    setHistory((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(false);

    if (!pnrVerified) {
      setTimeout(() => {
        if (input.trim().toLowerCase() === 'abc123') {
          addModelResponse(multiLang[language].categorySelectionPrompt);
          setPnrVerified(true);
          setPnr(input.trim());
          setShowOptions(true);
        } else {
          addModelResponse('Invalid PNR. Please try again.');
        }
        setLoading(false);
      }, 1000);
    } else if (geminiEnabled) {
      try {
        let result;
        const systemPrompt = createSystemPrompt();

        if (image) {
          // Use Gemini 1.5 Pro for image-based queries
          const imageData = await fileToGenerativePart(image);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
          result = await model.generateContent([systemPrompt, imageData]);
        } else {
          // Use Gemini 1.5 Flash for text-only queries
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          result = await model.generateContent([systemPrompt]);
        }

        const response = await result.response;
        const text = response.text();

        const [summary, ...responseParts] = text.split('\n\n');
        const [oneLiner] = summary.split('\n');
        const detailedResponse = responseParts.join('\n\n');

        const department = await determineDepartment(input, oneLiner);
        const jsonResponse = processUserQuery(input, oneLiner, department);

        if (!jsonSent) {
          sendJsonToBackend(jsonResponse);
          setJsonSent(true);
          setJsonGenerated(true);
        }

        addModelResponse(detailedResponse);
        setImagePreview(null);
        setImage(null);
        setImageBase64(null);
      } catch (error) {
        console.error(error);
        addModelResponse('Oops! Something went wrong.');
      }
      setLoading(false);
    }
  };

  const createSystemPrompt = useCallback(() => {
    return `You are an AI assistant for RailMadad, a grievance redressal mechanism developed by the Indian Railways. Provide helpful and accurate information about train services in India, ticketing, and passenger assistance. Be polite, professional, and concise. Do not make up information about specific trains, schedules, or policies. Don't ask for PNR number in any case as the user has already provided PNR number and it is ${pnr}. Also reply only and only in ${language} language. Don't Give markdown code, just plain simple english 
Current conversation history:
${history.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}
User's new message: ${input}
First, summarize the user's query in one sentence, then provide a simple summary in 2-3 sentences. After that, give a detailed response to the user's query.`;
  }, [history, input, language, pnr]);

  async function fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({
            inlineData: {
              data: reader.result.split(',')[1],
              mimeType: file.type
            }
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const determineDepartment = useCallback(
    async (query, oneLiner) => {
      const selectedDepartment = availableDepartments[option] || [];
      const languageDepartments = getLanguageDepartments(language, option);

      const departmentPrompt = `Given the following user query and its one-line summary, determine the most appropriate department from the list below. Only return the name of the department and its sub-category if applicable, nothing else.
    no markdown
    User query: ${query}
    One-line summary: ${oneLiner}

    Available departments and their sub-categories:
    ${languageDepartments.join(', ')}
    Please choose the most suitable department and sub-category from the list above no markdown`;

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([departmentPrompt]);
        const response = await result.response;
        const department = response.text().trim();

        const isValidDepartment = languageDepartments.some((dept) =>
          department.includes(dept)
        );

        return isValidDepartment ? department : 'Unknown';
      } catch (error) {
        console.error('Error determining department:', error);
        return 'Unknown';
      }
    },
    [language, option]
  );

  const getLanguageDepartments = useCallback((lang, selectedOption) => {
    const departments = {
      en: availableDepartments[selectedOption],
      hi: availableDepartments[
        multiLang.hi.categoriesArray[
          multiLang.en.categoriesArray.indexOf(selectedOption)
        ]
      ],
      tm: availableDepartments[
        multiLang.tm.categoriesArray[
          multiLang.en.categoriesArray.indexOf(selectedOption)
        ]
      ]
    };
    return departments[lang] || [];
  }, []);

  const processUserQuery = useCallback(
    (query, oneLiner, department) => {
      const uuid = generateUUID();
      return {
        pnr: pnr,
        uuid: uuid,
        timeCreated: new Date().toISOString(),
        departmentType: department,
        optionSelected: option,
        userQuery: query,
        oneLinerExplanation_of_UserQuery_in_english: oneLiner,
        image: imageBase64
      };
    },
    [pnr, option, imageBase64]
  );

  const generateUUID = useCallback(() => {
    const alphanumeric = Math.random().toString(36).substring(2, 6);
    const uuid = `${pnr}-${alphanumeric}`;
    setUUID(uuid);
    return uuid;
  }, [pnr]);

  const addModelResponse = useCallback((content) => {
    if (content === undefined || content === null) {
      console.warn(
        'Attempted to add undefined or null content to chat history'
      );
      return;
    }
    setHistory((prev) => [
      ...prev,
      {
        role: 'model',
        content: (
          <ErrorBoundary>
            <TypingAnimation
              content={typeof content === 'string' ? content : String(content)}
            />
          </ErrorBoundary>
        )
      }
    ]);
  }, []);

  const handleOptionSelect = useCallback(
    (selectedOption) => {
      setOption(selectedOption);
      addModelResponse(
        multiLang[language].youHaveSelected +
          ' ' +
          selectedOption +
          '. ' +
          multiLang[language].imageUploadQuestion
      );
      setShowOptions(false);
      setGeminiEnabled(true);
    },
    [language, addModelResponse]
  );

  const handleLanguageSelect = useCallback(
    (value) => {
      setLanguage(value);
      setShowLanguageOptions(false);
      addModelResponse(multiLang[value].PNR_Question);
    },
    [addModelResponse]
  );

  const sendJsonToBackend = useCallback((jsonData) => {
    console.log('Sending JSON to backend:', jsonData);
    NewComplaint(jsonData);
  }, []);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {history.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-2 rounded-lg ${
              item.role === 'model' ? 'bg-blue-100 ml-auto' : 'bg-green-100'
            }`}
          >
            <div className="flex items-start">
              {item.role === 'model' ? (
                <Bot className="mr-2 flex-shrink-0" />
              ) : (
                <UserRound className="mr-2 flex-shrink-0" />
              )}
              <p
                className={`${item.role === 'model' ? 'text-blue-800' : 'text-green-800'}`}
              >
                {item.content}
              </p>
            </div>
            {item.role === 'user' && item.image && (
              <img
                src={item.image}
                alt="User uploaded"
                className="mt-2 max-w-full h-auto rounded-lg"
              />
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="text-gray-500 italic">
            {multiLang[language]?.botThinkingText}
          </div>
        )}
      </div>

      {showLanguageOptions && (
        <div className="bg-white border rounded-lg p-4 mb-4 shadow-lg">
          <h3 className="font-bold text-lg mb-2">Choose Your Language</h3>
          <p className="text-sm text-gray-500 mb-4">
            Please select the language you prefer to communicate in:
          </p>
          <RadioGroup onValueChange={handleLanguageSelect}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="english" />
                <Label htmlFor="english">English</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hi" id="hindi" />
                <Label htmlFor="hindi">हिंदी (Hindi)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tm" id="tamil" />
                <Label htmlFor="tamil">தமிழ் (Tamil)</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {showOptions && (
        <div className="bg-white border rounded-lg p-4 mb-4 shadow-lg">
          <h3 className="font-bold text-lg mb-2">
            {multiLang[language]?.introQuestionBox}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {multiLang[language]?.selectionRequired}
          </p>
          <RadioGroup onValueChange={handleOptionSelect}>
            <div className="space-y-2">
              {multiLang[language]?.categoriesArray.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={`category_${index}`} />
                  <Label htmlFor={`category_${index}`}>{category}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {jsonGenerated && (
        <div className="text-green-500 font-semibold mb-4">
          Your ticket has been raised with UUID:{' '}
          <a
            href={`/complaint/${UUID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {UUID}
          </a>
        </div>
      )}

      {imagePreview && (
        <div className="relative inline-block mb-4">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-[150px] h-auto rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Textarea
          placeholder={
            pnrVerified
              ? multiLang[language]?.askForQuery
              : multiLang[language]?.placeholderText
          }
          value={input}
          onChange={handleInputChange}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={showOptions || showLanguageOptions || jsonGenerated}
        />
        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            showOptions ||
            showLanguageOptions ||
            jsonGenerated ||
            (!isTyping && !image)
          }
        >
          <Send className="h-4 w-4" />
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <Button
          onClick={() => fileInputRef.current.click()}
          disabled={!pnrVerified || jsonGenerated || option === null || loading}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
