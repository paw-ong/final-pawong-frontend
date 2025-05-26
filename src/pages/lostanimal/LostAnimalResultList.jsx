import React, { useState, useEffect, useCallback } from 'react';
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

    const fetchLostAnimals = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const searchParams = new URLSearchParams(location.search);
            const type = searchParams.get('type') || 'LOST';
            const size = 12;

            if (!token) {
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

            if (response.data && response.data.lostPostCards) {
                setLostAnimals(response.data.lostPostCards);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(page);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
            setError(errorMessage);
            
            if (error.response?.status === 401 || error.response?.status === 404) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [location.search, token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLostAnimals(0);
    }, []);

    useEffect(() => {
        if (token) {
            fetchLostAnimals(0);
        }
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
                    <LostAnimalCard key={animal.postId} animal={animal} />
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