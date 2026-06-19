package com.shopwise.security;

import com.shopwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return UserDetailsImpl.build(user);
    }

    public UserDetails loadUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + id));
        return UserDetailsImpl.build(user);
    }
}
