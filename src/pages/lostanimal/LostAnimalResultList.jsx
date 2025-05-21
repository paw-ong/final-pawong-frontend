import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../../api/client';
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

            const response = await client.get('/lost-animals', {
                params: {
                    type,
                    page,
                    size
                }
            });

            if (response.data && response.data.content) {
                setLostAnimals(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Failed to fetch lost animal list:', error);
            const errorMessage = error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
            setError(errorMessage);
            
            if (error.response?.status === 401 || error.response?.status === 404) {
                console.log('Authentication error, redirecting to login...');
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