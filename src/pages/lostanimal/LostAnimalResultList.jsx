import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LostAnimalResultList.css';
import LostAnimalCard from '../../components/lost-animal/LostAnimalCard';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../contexts/AuthContext';

const LostAnimalResultList = () => {
    const [lostAnimals, setLostAnimals] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useAuth();

    const fetchLostAnimals = async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('type') || 'LOST';
            const size = 12;

            if (!token) {
                console.error('No token available');
                navigate('/login');
                return;
            }

            // 토큰 디코딩하여 확인
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length !== 3) {
                    throw new Error('Invalid token format');
                }
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('Token payload:', payload);
            } catch (e) {
                console.error('Token decode error:', e);
            }

            console.log('Making API request with token:', token);
            console.log('Request URL:', `http://localhost:8080/api/lost-animals?type=${type}&page=${page}&size=${size}`);
            const response = await axios.get('http://localhost:8080/api/lost-animals', {
                params: {
                    type,
                    page,
                    size
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.content) {
                setLostAnimals(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Failed to fetch lost animal list:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            const errorMessage = error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
            setError(errorMessage);
            
            if (error.response?.status === 401 || error.response?.status === 404) {
                console.log('Authentication error, redirecting to login...');
                // 토큰이 있지만 유효하지 않은 경우 토큰을 제거하고 로그인 페이지로 이동
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            console.log('No token found, redirecting to login...');
            navigate('/login');
            return;
        }
        fetchLostAnimals(0);
    }, [location.search, token]);

    const handlePageChange = (page) => {
        fetchLostAnimals(page);
    };

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="lost-animal-result-list">
            <div className="lost-animal-grid">
                {lostAnimals.map((animal) => (
                    <LostAnimalCard key={animal.id} animal={animal} />
                ))}
            </div>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default LostAnimalResultList; 